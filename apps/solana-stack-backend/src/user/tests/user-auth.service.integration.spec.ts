import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../app.module';
import { GetSignInRequestService } from '../slice/auth/get/get.sign-in-request.service';
import { GetSignInRequestRepo } from '../slice/auth/get/get.sign-in-request.repo';
import { MongooseModule } from '@nestjs/mongoose';
import { UserModule } from '../user.module';
import { UserController } from '../user.controller';
import {
  SignInRequest,
  SignInRequestSchema,
} from '@app/ss-common-domain/user/base/entity/sign-in-request.entity';
import { VerifySignInAuthRequestDto } from '@app/ss-common-domain/user/base/dto/verify-sign-in-auth-request.dto';

const msg =
  'CkEPqd6Hn8TFFni9hvky6GJ8amLCtW5X5kW1p1HsZbu1ueGaqma2aJTe3nTqk1xZcZ1NBhh5kM3LMuDqy5xKcXs12nz2e8pAf99V8Epqv9xhjZtqz6yrxsbjxAoMP2UvxCSzMrnhjqAWHfB69v3w62BE1WjtD31eSveAKwhu3GuphJy23prwdTwHfTLGjKGBrnbtsiPyPakcMYr32E4cjZ6wBFpVHefzSqmK6ySEzwyMLVBRUDTx7MHAeYJusZaz6XRLmy8iz2UsGLxCirbNeeCsgLchq2172EGkWVitj9M8Kuiy35dbr5EF6JZv5eEU29PT4VGDdCYG3zSGTCAkKM18UfagvxjZRqKHERXumpPNU2VKMK1XCW7S9N5w4Z2XGWWrDZn5WyNdqtFUdKU7o95Ceo3QnD9wuxNTu2xVVRqfTjHFUmNhdfan6KA7zteVerHqtNWWW8nG8ciyhEQVYvJT6Dyj9MtTcYJHTSqbtvHBh2yFA615EYjwPpBpx9ykCS8mTwyKoD436t2JhfswrYiECXeTVt18zB35TE3qHXR4TTM6v71o9EsZsX7ntubeZZ9HdLEnWiZEnDRMCK3YsDvTzRdWdo21AztnjoKPT32iXqab6Ep';

const msgInvalid =
  '1111CkEPqd6Hn8TFFni9hvky6GJ8amLCtW5X5kW1p1HsZbu1ueGaqma2aJTe3nTqk1xZcZ1NBhh5kM3LMuDqy5xKcXs12nz2e8pAf99V8Epqv9xhjZtqz6yrxsbjxAoMP2UvxCSzMrnhjqAWHfB69v3w62BE1WjtD31eSveAKwhu3GuphJy23prwdTwHfTLGjKGBrnbtsiPyPakcMYr32E4cjZ6wBFpVHefzSqmK6ySEzwyMLVBRUDTx7MHAeYJusZaz6XRLmy8iz2UsGLxCirbNeeCsgLchq2172EGkWVitj9M8Kuiy35dbr5EF6JZv5eEU29PT4VGDdCYG3zSGTCAkKM18UfagvxjZRqKHERXumpPNU2VKMK1XCW7S9N5w4Z2XGWWrDZn5WyNdqtFUdKU7o95Ceo3QnD9wuxNTu2xVVRqfTjHFUmNhdfan6KA7zteVerHqtNWWW8nG8ciyhEQVYvJT6Dyj9MtTcYJHTSqbtvHBh2yFA615EYjwPpBpx9ykCS8mTwyKoD436t2JhfswrYiECXeTVt18zB35TE3qHXR4TTM6v71o9EsZsX7ntubeZZ9HdLEnWiZEnDRMCK3YsDvTzRdWdo21AztnjoKPT32iXqab6Ep';

const pk = '8SuB8Wkoj4nc9d5GbEp6gfbmSdsmNzaTeUQTz1FVFgsz';
const pk2 = '8kD4c8cU3ShPst4jbDfMtuJqQ6RSvgyQPhsE46y7fgS6';
const sig =
  '2NhY2Je5whFFot2wZf9cSa9Tm1CmxtFPcEHGYULn71Q5vChG49g8gSgsKKyFLhYzgMR7H4vh7VVm3fu3eymFTwss';
const subMessage =
  'AQICAHhAKaK+MtvPXJ9QGonscwhMCY4pU/5hyXy7Kh3N/7e4zgGwB/txl9JEf3fQi/ZqhXFBAAAAgzCBgAYJKoZIhvcNAQcGoHMwcQIBADBsBgkqhkiG9w0BBwEwHgYJYIZIAWUDBAEuMBEEDJgOs/jfFQGetey+KgIBEIA/f3UEAuG1QAuf3YDPhAAP3GSqU1fxdAPlptsjnVMbpjDVQ/r0yMH2PrlHXWLvJC+jImBqLmqkyppncT79fw45';

const expiredToken =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCIsImN0eSI6IkpXVCJ9.eyJzdWIiOiI4OWM3ZGMxNC0yMjEwLTRlYWYtOWYwYy0xOTM2NjBhMDAxNjUiLCJqdGkiOiI1NmI1YjgzZC00YjhjLTQzZmItOWQ0MC05MzJjZWRiNzM2NDkiLCJhcHBfcm9sZSI6ImFwaSIsImlkZW50aXR5SWQiOiI5OWYwYWE5Ni1iY2Y5LTQwZTItODNjYi1lNjNmZTY0Y2MzYmYiLCJ1c2VySWQiOiI4OWM3ZGMxNC0yMjEwLTRlYWYtOWYwYy0xOTM2NjBhMDAxNjUiLCJleHAiOjE3MDM1NDMyNzAsImlzcyI6IlZlcml2ZW5kLlNlY3VyaXR5LkJlYXJlciIsImF1ZCI6IlZlcml2ZW5kLlNlY3VyaXR5LkJlYXJlciJ9.ioHYhkav9Ab9z0ur_69NKALTQ4_xSPD_t0QTKk1HQwE';

describe('User Integration Tests', () => {
  let app: INestApplication;
  let getSignInRequestService: GetSignInRequestService;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        UserModule,
        AppModule,
        MongooseModule.forRoot(process.env.MONGO_DB_URL),
        MongooseModule.forFeature([
          {
            name: SignInRequest.name,
            schema: SignInRequestSchema,
          },
        ]),
      ],
      providers: [
        GetSignInRequestService,
        GetSignInRequestRepo,
        UserController,
      ],
    }).compile();

    getSignInRequestService = moduleFixture.get<GetSignInRequestService>(
      GetSignInRequestService,
    );
    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });
  it('should get sign in request', async () => {
    const nounce =
      'MWVhYjlmMTRjZWY5YTY1NmMzZmNkNjNkYjZmNjJiZTA4ZjBjYzUwZDAwNWU2ZmUzZGFkMWIwY2UyOTkzYjJhMWU5MDNlOTcxNDhkZmM3ZTY3NTUwZTVjYTZhNjliOGNk';

    const signInRequestNounce =
      await getSignInRequestService.getSignInRequestByNonce(nounce);

    const signInRequestId = await getSignInRequestService.getSignInRequestById(
      '663e95be9b7ed5caeba9f4cd',
    );

    console.log(signInRequestNounce);
    console.log(signInRequestId);
  });

  it('should create user auth request', async () => {
    return request(app.getHttpServer())
      .get('/user/auth')
      .expect(200)
      .expect((res) => {
        expect(res.body.statement).toEqual(
          'Solana Stack wants to sign you in using your wallet',
        );
        expect(res.body.version).toEqual('1');
        expect(res.body.chainId).toEqual('devnet');
        expect(res.body.requestId).toBeDefined();
        expect(res.body.nonce).toBeDefined();
      });
  });

  it('should sign in user', async () => {
    const payload: VerifySignInAuthRequestDto = {
      message: msg,
      publicKey: pk,
      signature: sig,
    };

    return request(app.getHttpServer())
      .post('/user/sign-in')
      .send(payload)
      .expect(201)
      .expect((res) => {
        expect(res.body.isValidWalletUser).toBeTruthy();
        expect(res.body.accessToken).toBeDefined();
      });
  });
});
