import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';

import * as base58 from 'bs58';
import { AppModule } from '../../app.module';
import * as nacl from 'tweetnacl';

describe('AppController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

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

  it('should ', () => {});
});
