import { Test, TestingModule } from '@nestjs/testing';
import { ConfigModule } from '@nestjs/config';
import { CreateTokenAccountMintTokenService } from '@app/solana';
import { SolsUtils } from '@app/solana/utils/sols-utils.service';
import { MintTokenAccountVal } from '@app/solana/spl/mint-token-account.val';

describe('Create Mint Project Tokens', () => {
  let createTokenAccountMintTokenService: CreateTokenAccountMintTokenService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule.forRoot()],
      providers: [CreateTokenAccountMintTokenService, SolsUtils],
    }).compile();

    createTokenAccountMintTokenService =
      module.get<CreateTokenAccountMintTokenService>(
        CreateTokenAccountMintTokenService,
      );
  });

  it('should create token', async () => {
    const mintTokenAccountVal: MintTokenAccountVal = {
      decimals: 9,
      mintKeyPair: undefined,
      sellerFeeBasisPoints: 0,
      tokenName: 'Solana Stack',
      tokenSymbol: 'SOLSTACK',
      tokenUri: '',
      totalSupply: 0,
      userWalletPubKey: '',
    };

    const createToken =
      createTokenAccountMintTokenService.createMintTokenAccount();
    //console.log(await service.getEndpointInfo());
    //console.log(await service.initialiseBackendKeyPair());
    expect(createTokenAccountMintTokenService).toBeDefined();
  });

  it('should mint token token', async () => {
    //console.log(await service.getEndpointInfo());
    //console.log(await service.initialiseBackendKeyPair());
    expect(createTokenAccountMintTokenService).toBeDefined();
  });
});
