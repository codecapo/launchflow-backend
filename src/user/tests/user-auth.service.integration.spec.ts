import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';

import * as base58 from 'bs58';
import { AppModule } from '../../app.module';
import * as nacl from 'tweetnacl';
import { GetSignInRequestService } from '../slice/auth/get.sign-in-request.service';
import { Types } from 'mongoose';
import { ObjectId } from 'mongodb';
import { GetSignInRequestRepo } from '../slice/auth/get.sign-in-request.repo';
import { MongooseModule } from '@nestjs/mongoose';
import {
  SignInRequest,
  SignInRequestSchema,
} from '../common/domain/entity/sign-in-request.entity';

describe('AppController (e2e)', () => {
  let app: INestApplication;
  let getSignInRequestService: GetSignInRequestService;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        AppModule,
        MongooseModule.forRoot(process.env.MONGO_DB_URL),
        MongooseModule.forFeature([
          {
            name: SignInRequest.name,
            schema: SignInRequestSchema,
          },
        ]),
      ],
      providers: [GetSignInRequestService, GetSignInRequestRepo],
    }).compile();

    getSignInRequestService = moduleFixture.get<GetSignInRequestService>(
      GetSignInRequestService,
    );
    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/ (GET)', () => {
    const msg1 = 'Message to sign';
    const pk1 = '8SuB8Wkoj4nc9d5GbEp6gfbmSdsmNzaTeUQTz1FVFgsz';
    const sig2 =
      '4NobMMQgtw3Jo9MZQD1mqk4qJC6iGYgLbvc92EyQqnxUk8ENtLmSqE2cZTcjrzUAhiGTq3jJAGPVxhMEj8La8kUG';

    const verified1 = nacl.sign.detached.verify(
      new TextEncoder().encode(msg1),
      base58.decode(sig2),
      base58.decode(pk1),
    );

    console.log(verified1);

    return request(app.getHttpServer())
      .get('/')
      .expect(200)
      .expect('Hello World!');
  });

  it('should get sign in request', async () => {
    const nounce =
      'MWVhYjlmMTRjZWY5YTY1NmMzZmNkNjNkYjZmNjJiZTA4ZjBjYzUwZDAwNWU2ZmUzZGFkMWIwY2UyOTkzYjJhMWU5MDNlOTcxNDhkZmM3ZTY3NTUwZTVjYTZhNjliOGNk';

    const signInRequestNounce =
      await getSignInRequestService.getSignInRequest(nounce);

    const signInRequestId = await getSignInRequestService.getSignInRequestById(
      '663e95be9b7ed5caeba9f4cd',
    );

    console.log(signInRequestNounce);
    console.log(signInRequestId);
  });
});
