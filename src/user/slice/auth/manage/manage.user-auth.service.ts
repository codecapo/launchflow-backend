import { SolanaSignInInput } from '@solana/wallet-standard-features';
import * as base58 from 'bs58';
import * as nacl from 'tweetnacl';
import { Injectable, Logger } from '@nestjs/common';
import * as crypto from 'crypto';
import { CreateUserService } from '../../manage/create/create.user.service';
import { GetUsersService } from '../../manage/get/get.user.service';

import { JwtService } from '@nestjs/jwt';
import { ValidateAccessTokenService } from '../validate/validate.access-token.service';
import { SaveAccessTokenService } from '../save/save.access-token.service';
import { SaveSignInRequestService } from '../save/save.sign-in-request.service';

import { GetSignInRequestService } from '../get/get.sign-in-request.service';
import { RevokeAccessTokenService } from '../revoke/revoke.access-token.service';
import { SaveSignInRequestDto } from '@app/ss-common-domain/user/base/dto/save-sign-in-request.dto';
import { VerifySignInAuthResponseDto } from '@app/ss-common-domain/user/base/dto/verify-sign-in-auth-response.dto';
import * as generator from 'generate-password';

@Injectable()
export class ManageUserAuthService {
  private logger: Logger = new Logger(ManageUserAuthService.name);

  constructor(
    private readonly createUserService: CreateUserService,
    private readonly getUserService: GetUsersService,
    private readonly jwtService: JwtService,
    private readonly validateAccessTokenService: ValidateAccessTokenService,
    private readonly saveAccessTokenService: SaveAccessTokenService,
    private readonly getSignInRequestService: GetSignInRequestService,
    private readonly saveSignInRequestService: SaveSignInRequestService,
    private readonly revokeAccessTokenService: RevokeAccessTokenService,
  ) {}

  async userSignIn(publicKey: string) {
    const now: Date = new Date();
    const uri = `${process.env.SIGN_IN_URL}`;
    const currentUrl = new URL(uri);
    const domain = currentUrl.host;

    const currentDateTime = now.toISOString();

    const generatedNounce = generator.generate({
      length: 10,
      numbers: true,
    });

    const signInData: SolanaSignInInput = {
      domain,
      statement: 'Solana Stack wants to sign you in using your wallet',
      version: '1',
      nonce: generatedNounce,
      chainId: 'devnet',
      issuedAt: currentDateTime,
      requestId: crypto.randomUUID(),
    };

    const signInRequestData: SaveSignInRequestDto = {
      requestId: signInData.requestId,
      nonce: generatedNounce,
      publicKey: publicKey,
    };

    await this.saveSignInRequestService.saveSignInRequest(signInRequestData);

    return signInData;
  }

  async verifyWalletSignIn(msg: any, sig: any, pk: any) {
    const message = base58.decode(msg);
    const signature = base58.decode(sig);
    const publicKey = base58.decode(pk);

    const stringMsg = Buffer.from(message).toString('utf8');
    const startPoint = stringMsg.indexOf('Nonce');
    const endPoint = stringMsg.indexOf('Issued At:');

    const subMessage = stringMsg.substring(startPoint + 6, endPoint).trim();

    const getSignInRequest =
      await this.getSignInRequestService.getSignInRequestByNonce(subMessage);

    if (getSignInRequest === null)
      throw Error('Sign in request not found for user');

    const verified = nacl.sign.detached.verify(message, signature, publicKey);

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
        this.logger.debug(`Found user ${findCreateUser.publicKey}`);
        const token =
          await this.validateAccessTokenService.isAccessTokenExpired(
            walletAddress,
          );

        if (token.isExpired) {
          const newAccessToken = await this.jwtService.signAsync(
            { pk: walletAddress },
            {
              expiresIn: process.env.JWT_EXPIRES_IN,
              secret: process.env.JWT_KEY,
            },
          );

          await this.saveAccessTokenService.updateAccessToken(
            walletAddress,
            newAccessToken,
          );

          const verifySignInAuthResponse: VerifySignInAuthResponseDto = {
            accessToken: newAccessToken,
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
              {
                expiresIn: process.env.JWT_EXPIRES_IN,
                secret: process.env.JWT_KEY,
              },
            );

            await this.saveAccessTokenService.saveAccessToken(
              walletAddress,
              revokeAndIssueAccessToken,
            );

            return {
              accessToken: revokeAndIssueAccessToken,
            };
          }
        }
      }
    }
  }
}
