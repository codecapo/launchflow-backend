import { Test, TestingModule } from '@nestjs/testing';
import { ConfigModule } from '@nestjs/config';
import { MintModule } from '../../../../mint.module';
import { SerialisedCreateMintTokenService, SolanaModule } from '@app/solana';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { MongooseModule } from '@nestjs/mongoose';
import { HttpModule, HttpService } from '@nestjs/axios';
import { SplMintController } from '../controller/spl.mint.controller';
import { MetadataController } from '../../../metadata/controller/metadata.controller';
import { SolsUtils } from '@app/solana/utils/sols-utils.service';

describe('Create Token Mint Account Service', () => {
  jest.setTimeout(30000000);
  let app: INestApplication;
  let httpService: HttpService;
  let solsUtil: SolsUtils;
  let serialisedCreateMintTokenService: SerialisedCreateMintTokenService;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        HttpModule,
        ConfigModule.forRoot(),
        MintModule,
        SolanaModule,
        MongooseModule.forRoot(process.env.DB_CONNECTION, { dbName: 'test' }),
      ],
      controllers: [SplMintController, MetadataController],
    }).compile();

    app = module.createNestApplication();
    serialisedCreateMintTokenService =
      module.get<SerialisedCreateMintTokenService>(
        SerialisedCreateMintTokenService,
      );

    solsUtil = module.get<SolsUtils>(SolsUtils);

    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it('should create token', async () => {
    return request(app.getHttpServer())
      .post('/spl/create/token-mint-account')
      .attach(
        'file',
        'src/mint/slice/spl/create/tests/resources/test-asset-one.jpg',
      )
      .field('walletAddress', '8SuB8Wkoj4nc9d5GbEp6gfbmSdsmNzaTeUQTz1FVFgsz')
      .field('tokenMintPubKey', 'HLRk173XZaEfLEuW6EtwppXkPEFTPfq6YvP1GYfio1tN')
      .field('type', 'SPL')
      .field('name', 'randomFromAnyWhere')
      .field('symbol', '$RAND')
      .field('description', 'best alt for solana')
      .field('supply', 1000000000)
      .then((res) => {
        const resbody = res.body;

        console.log(resbody);
      });
  });

  // it(' simulate user login', async () => {
  //   const frontendPrivKey = process.env.TEST_FRONTEND_PRIV_KEY;
  //   const umi = createUmi(process.env.QUICKNODE_ENDPOINT).use(
  //     mplTokenMetadata(),
  //   );
  //
  //   const frontendWallet = umi.eddsa.createKeypairFromSecretKey(
  //     base58.decode(frontendPrivKey),
  //   );
  //
  //   const umiFrontendUser = umi.use(keypairIdentity(frontendWallet));
  //
  //   const signInUser =
  //     await solsUtil.simulateFrontendUserSignIn(umiFrontendUser);
  //
  //   console.log(signInUser);
  // });
});
