import { SerialisedCreateMintTokenService } from '@app/solana';
import { Injectable, Logger } from '@nestjs/common';
import {
  CreateAndMintTokenRequest,
  CreateAndMintTokenResponse,
} from '@app/ss-common-domain/mint/dto/spl.dtos';
import { CreateMintTokenWithProjectInfoDto } from '@app/ss-common-domain/user/base/dto/create-mint-token-with-project-info.dto';
import { SplCreateRepo } from '../repo/spl.create.repo';
import { EncryptionService } from '@app/encryption';

@Injectable()
export class SplCreateService {
  private readonly logger = new Logger(SplCreateService.name);
  constructor(
    private readonly serialisedCreateMintTokenService: SerialisedCreateMintTokenService,
    private readonly encryptionService: EncryptionService,
    private readonly splCreateRepo: SplCreateRepo,
  ) {}

  public async createAndMintToken(
    image: Express.Multer.File,
    createAndMintTokenRequest: CreateAndMintTokenRequest,
  ): Promise<CreateMintTokenWithProjectInfoDto> {
    // create and mint the token
    const createMintToken: CreateAndMintTokenResponse =
      await this.serialisedCreateMintTokenService.createAndMintSupplyToken(
        image,
        createAndMintTokenRequest,
      );

    const mintAuthPrivKeyEncrypted = await this.encryptionService.kmsEncrypt(
      createMintToken.mintAuthPrivKey,
    );

    const mintPrivKeyEncrypted = await this.encryptionService.kmsEncrypt(
      createMintToken.mintPrivKey,
    );

    // updateUser the token
    const saveCreatedAndMintedToken: CreateMintTokenWithProjectInfoDto = {
      userWalletAddress: createAndMintTokenRequest.userWalletAddress,
      type: createAndMintTokenRequest.type,
      name: createAndMintTokenRequest.name,
      symbol: createAndMintTokenRequest.symbol,
      supply: createAndMintTokenRequest.mintAmount,
      description: createAndMintTokenRequest.description,
      metadataUri: createMintToken.metadataUri,
      mintAuthPrivKey: mintAuthPrivKeyEncrypted,
      mintAuthPubKey: createMintToken.mintAuthPubKey,
      mintPrivKey: mintPrivKeyEncrypted,
      mintPubKey: createMintToken.mintPubkey,
      serialisedTransaction: createMintToken.serialisedTransaction,
    };

    const updateUser =
      await this.splCreateRepo.addCreatedAndMintedSplTokenToUserProfile(
        saveCreatedAndMintedToken,
      );

    if (updateUser) {
      const createdToken = updateUser.projectTokens.filter((projectToken) => {
        const pt = projectToken.mintPubKey == createMintToken.mintPubkey;
        if (pt) return projectToken;
      });

      console.log(createMintToken);

      const saveCreatedAndMintedToken: CreateMintTokenWithProjectInfoDto = {
        userWalletAddress: createAndMintTokenRequest.userWalletAddress,
        type: createdToken[0].type,
        name: createdToken[0].name,
        symbol: createdToken[0].symbol,
        supply: createdToken[0].supply,
        description: createdToken[0].description,
        metadataUri: createdToken[0].metadataUri,
        mintAuthPrivKey: createMintToken.mintAuthPrivKey,
        mintAuthPubKey: createdToken[0].mintAuthPubKey,
        mintPrivKey: createMintToken.mintPrivKey,
        mintPubKey: createdToken[0].mintPubKey,
        serialisedTransaction: createMintToken.serialisedTransaction,
      };

      return saveCreatedAndMintedToken;
    }
  }
}
