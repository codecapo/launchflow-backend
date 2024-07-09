import { CreateTokenMintAccountRepo } from '../repo/create.token-mint-account.repo';

import { Injectable, Logger } from '@nestjs/common';
import { CreateTokenAccountMintTokenService } from '@app/solana';
import { SolsUtils } from '@app/solana/utils/sols-utils.service';
import { CommonUserService } from '@app/ss-common-domain/user/service/common.user.service';
import { CreateTokenMintAccountRequestDto } from '@app/ss-common-domain/mint/dto/create.token-mint-account.request.dto';
import { ProjectTokenInfo } from '@app/ss-common-domain/mint/entity/project-token-info.entity';
import { MintTokenAccountVal } from '@app/solana/spl/mint-token-account.val';
import { CreateTokenMintAccountResponseDto } from '@app/ss-common-domain/mint/dto/create.token-mint-account.response.dto';
import { CreateMetadataService } from '../../../metadata/service/create.metadata.service';
import { ProjectToken } from '@app/ss-common-domain/mint/entity/project-token.entity';

@Injectable()
export class CreateTokenMintAccountService {
  private logger: Logger = new Logger();
  constructor(
    private readonly createMintRepo: CreateTokenMintAccountRepo,
    private readonly createTokenAccountMintTokenService: CreateTokenAccountMintTokenService,
    private readonly createMetadataService: CreateMetadataService,
    private readonly solUtls: SolsUtils,
    private readonly commonUserService: CommonUserService,
  ) {}

  // // just add validation before you create the token
  // public async createTokenMintAccount(
  //   image: Express.Multer.File,
  //   createStandardTokenRequestDto: CreateTokenMintAccountRequestDto,
  // ) {
  //   if (!createStandardTokenRequestDto)
  //     throw new Error('please supply all required fields to create token');
  //
  //   const projectTokenInfo: ProjectTokenInfo = {
  //     description: createStandardTokenRequestDto.description,
  //     metadataUri: createStandardTokenRequestDto.metadataUri,
  //     mintAccountAddress: createStandardTokenRequestDto.mintAccountAddress,
  //     name: createStandardTokenRequestDto.name,
  //     symbol: createStandardTokenRequestDto.symbol,
  //     type: createStandardTokenRequestDto.type,
  //     supply: createStandardTokenRequestDto.supply,
  //   };
  //
  //   const projectTokenMintKey = await this.commonUserService.getUser(
  //     createStandardTokenRequestDto.walletAddress,
  //   );
  //
  //   const requiredProjectToken = projectTokenMintKey.projectTokens
  //     .filter((item: ProjectToken) => {
  //       if (
  //         item[0].mintKeys.mintPubKey ===
  //         createStandardTokenRequestDto.tokenMintPubKey
  //       ) {
  //         console.log('matched item');
  //         console.log(item);
  //         return item;
  //       }
  //     })
  //     .at(0);
  //
  //   console.log(requiredProjectToken);
  //
  //   const mintKeyPair = await this.solUtls.decryptAndRecreateMinKeyPair(
  //     requiredProjectToken[0].mintKeys.mintPrivKey,
  //   );
  //
  //   // create token metadata - create and upload image
  //   // create and upload token metadata
  //
  //   const metadata =
  //     await this.createMetadataService.createAndPinMetadataForSplToken(
  //       image,
  //       createStandardTokenRequestDto.name,
  //       createStandardTokenRequestDto.symbol,
  //       createStandardTokenRequestDto.description,
  //     );
  //
  //   projectTokenInfo.metadataUri = `${process.env.PINATA_BASE_URL}${metadata.ipfsHash}`;
  //
  //   // save token mint info
  //   await this.createMintRepo.createTokenMintAccount(
  //     createStandardTokenRequestDto.walletAddress,
  //     projectTokenInfo,
  //     createStandardTokenRequestDto.tokenMintPubKey,
  //   );
  //
  //   const mintTokenAccount: MintTokenAccountVal = {
  //     decimals: Number(process.env.DEFAULT_TOKEN_DECIMAL),
  //     mintKeyPair: mintKeyPair,
  //     sellerFeeBasisPoints: 0,
  //     tokenName: projectTokenInfo.name,
  //     tokenSymbol: projectTokenInfo.symbol,
  //     tokenUri: projectTokenInfo.metadataUri,
  //     totalSupply: projectTokenInfo.supply,
  //     userWalletPubKey: createStandardTokenRequestDto.walletAddress,
  //   };
  //
  //   const createTokenAccount =
  //     await this.createTokenAccountMintTokenService.createMintTokenAccount(
  //       mintTokenAccount,
  //     );
  //
  //   const response: CreateTokenMintAccountResponseDto = {
  //     transactionMsg: createTokenAccount,
  //   };
  //
  //   this.logger.log(`Sending create mint token account transaction signature`);
  //   return response;
  // }
}
