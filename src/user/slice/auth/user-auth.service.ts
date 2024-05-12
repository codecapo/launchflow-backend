import { SolanaSignInInput } from '@solana/wallet-standard-features';
import * as base58 from 'bs58';
import * as nacl from 'tweetnacl';
import { Injectable, Logger } from '@nestjs/common';
import * as crypto from 'crypto';
import { CreateUserService } from '../manage/create/create.user.service';
import { GetUsersService } from '../manage/get/get.user.service';
import { VerifySignInAuthResponseDto } from '../../common/domain/dto/verify-sign-in-auth-response.dto';
import { JwtService } from '@nestjs/jwt';
import { ValidateAccessTokenService } from './validate.access-token.service';
import { EncryptionService } from '@app/encryption';
import { SaveAccessTokenService } from './save.access-token.service';
import { SaveSignInRequestService } from './save.sign-in-request.service';
import { SaveSignInRequestDto } from '../../common/domain/dto/save-sign-in-request.dto';
import { GetSignInRequestService } from './get.sign-in-request.service';
import { RevokeAccessTokenService } from './revoke.access-token.service';

@Injectable()
export class UserAuthService {
  private logger: Logger = new Logger(UserAuthService.name);

  constructor(
    private readonly createUserService: CreateUserService,
    private readonly getUserService: GetUsersService,
    private readonly jwtService: JwtService,
    private readonly validateAccessTokenService: ValidateAccessTokenService,
    private readonly encryptionService: EncryptionService,
    private readonly saveAccessTokenService: SaveAccessTokenService,
    private readonly getSignInRequestService: GetSignInRequestService,
    private readonly saveSignInRequestService: SaveSignInRequestService,
    private readonly revokeAccessTokenService: RevokeAccessTokenService,
  ) {}

  async userSignIn() {
    const now: Date = new Date();
    const uri = `${process.env.SIGN_IN_URL}`;
    const currentUrl = new URL(uri);
    const domain = currentUrl.host;

    const nounce = await this.encryptionService.kmsEncrypt(crypto.randomUUID());

    const currentDateTime = now.toISOString();

    const signInData: SolanaSignInInput = {
      domain,
      statement:
        'Solana Stack wants to sign you in using your wallet',
      version: '1',
      nonce: nounce,
      chainId: 'devnet',
      issuedAt: currentDateTime,
      requestId: crypto.randomUUID(),
    };

    const signInRequestData: SaveSignInRequestDto = {
      nounce: signInData.nonce,
      requestId: signInData.requestId,
    };

    await this.saveSignInRequestService.saveSignInRequest(signInRequestData);

    this.logger.log('Received sign in request from user');

    return signInData;
  }

  async verifyWalletSignIn(msg: any, sig: any, pk: any) {
    const message = base58.decode(msg);
    const signature = base58.decode(sig);
    const publicKey = base58.decode(pk);

    const stringMsg = Buffer.from(message).toString('utf8');
    const startPoint = stringMsg.indexOf('nounce');
    const endPoint = stringMsg.indexOf('chain id');

    const subMessage = stringMsg.substring(startPoint + 7, endPoint).trim();

    const getSignInRequest =
      await this.getSignInRequestService.getSignInRequest(subMessage);

    if (getSignInRequest === null)
      throw Error('Sign in request not found for user');

    const decryptedPayloadNounce =
      await this.encryptionService.kmsDecryptAndVerify(subMessage);

    const decryptedDbNounce = await this.encryptionService.kmsDecryptAndVerify(
      getSignInRequest.nounce,
    );

    const isMatch =
      Buffer.from(decryptedPayloadNounce.Plaintext).toString('utf8') ===
      Buffer.from(decryptedDbNounce.Plaintext).toString('utf8');

    const verified =
      isMatch && nacl.sign.detached.verify(message, signature, publicKey);

    verified
      ? this.logger.log(`User ${pk} is verified`)
      : this.logger.log(`User ${pk} is not verified`);

    return verified;
  }

  async getUserOrCreateIfUserNotExist(publicKey: string) {
    const findUser = await this.getUserService.getUser(publicKey);

    if (findUser) {
      return findUser;
    } else {
      return await this.createUserService.createUser(publicKey);
    }
  }

  async manageJwt(
    isWalletAuthVerified: boolean,
    walletAddress: string,
  ): Promise<VerifySignInAuthResponseDto> {
    if (!walletAddress) throw Error('Please provide address');

    if (isWalletAuthVerified) {
      const findCreateUser =
        await this.getUserOrCreateIfUserNotExist(walletAddress);

      if (findCreateUser) {
        const token =
          await this.validateAccessTokenService.isAccessTokenExpired(
            walletAddress,
          );

        if (token.isExpired) {
          const newAccessToken = await this.jwtService.signAsync(
            { pk: walletAddress },
            { expiresIn: '8h', secret: process.env.JWT_KEY },
          );

          await this.saveAccessTokenService.saveAccessToken(
            walletAddress,
            newAccessToken,
          );

          const verifySignInAuthResponse: VerifySignInAuthResponseDto = {
            accessToken: newAccessToken,
            isValidWalletUser: isWalletAuthVerified,
          };

          this.logger.log(`Successfully authenticated user ${walletAddress}`);

          return verifySignInAuthResponse;
        } else {
          const revokedAccessToken =
            await this.revokeAccessTokenService.revoke(walletAddress);

          if (!revokedAccessToken.revoked) {
            throw Error('Failed to revoke access token');
          } else {
            this.logger.log(
              `Revoking current access token and issuing new access token ${walletAddress}`,
            );

            const revokeAndIssueAccessToken = await this.jwtService.signAsync(
              { pk: walletAddress },
              { expiresIn: '8h', secret: process.env.JWT_KEY },
            );

            await this.saveAccessTokenService.saveAccessToken(
              walletAddress,
              revokeAndIssueAccessToken,
            );

            return {
              accessToken: revokeAndIssueAccessToken,
              isValidWalletUser: isWalletAuthVerified,
            };
          }
        }
      }
    }
  }
}
