import { Injectable, Logger } from '@nestjs/common';
import { CreateTokenAccountMintTokenService } from '@app/solana';
import { CommonUserService } from '@app/ss-common-domain/user/service/common.user.service';
import { SolsUtils } from '@app/solana/utils/sols-utils.service';
import { CreateMintTokenSupplyDto } from '@app/ss-common-domain/mint/dto/create.mint-token-supply.dto';
import { MintTokenSupplyVal } from '@app/solana/spl/mint-token-supply.val';

@Injectable()
export class CreateMintTokenSupplyService {
  private logger: Logger = new Logger(CreateMintTokenSupplyService.name);

  constructor(
    private readonly createTokenAccountMintTokenService: CreateTokenAccountMintTokenService,
    private readonly commonUserService: CommonUserService,
    private readonly solsUtils: SolsUtils,
  ) {}

  // public async mintProjectTokenSupply(
  //   createMintTokenSupplyDto: CreateMintTokenSupplyDto,
  // ) {
  //   if (!createMintTokenSupplyDto)
  //     throw Error(
  //       'please populate user wallet and mint token address in order to mint a token',
  //     );
  //
  //   const findProjectToken = await this.commonUserService.getUser(
  //     createMintTokenSupplyDto.userWalletAddress,
  //   );
  //
  //   const projectTokenMintPrivKey = findProjectToken.projectTokens.filter(
  //     (item) =>
  //       item.projectTokenInfo.mintAccountAddress ===
  //       createMintTokenSupplyDto.mintAddress,
  //   )[0];
  //
  //   const mintTokenKeyPair = await this.solsUtils.recreateMinKeyPair(
  //     projectTokenMintPrivKey.mintKeys.mintPrivKey,
  //   );
  //
  //   const mintTokenSupplyVal: MintTokenSupplyVal = {
  //     mintKeyPair: mintTokenKeyPair,
  //     tokenName: projectTokenMintPrivKey.projectTokenInfo.name,
  //     totalSupply: projectTokenMintPrivKey.projectTokenInfo.supply,
  //     userWalletPubKey: createMintTokenSupplyDto.userWalletAddress,
  //   };
  //
  //   const mintSupply =
  //     await this.createTokenAccountMintTokenService.mintTokenSupply(
  //       mintTokenSupplyVal,
  //     );
  //
  //   this.logger.log(
  //     `User ${createMintTokenSupplyDto.userWalletAddress} requested to mint tokens for mint address ${createMintTokenSupplyDto.mintAddress}`,
  //   );
  //
  //   return mintSupply;
  // }
}
