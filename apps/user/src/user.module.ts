import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  User,
  UserSchema,
} from '@app/ss-common-domain/user/base/entity/user.entity';
import {
  AccessToken,
  AccessTokenSchema,
} from '@app/ss-common-domain/user/base/entity/access-token.entity';
import {
  SignInRequest,
  SignInRequestSchema,
} from '@app/ss-common-domain/user/base/entity/sign-in-request.entity';
import { PassportModule } from '@nestjs/passport';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { ManageUserAuthService } from './auth/manage/manage.user-auth.service';
import { CreateUserService } from './manage/create/create.user.service';
import { GetUsersService } from './manage/get/get.user.service';
import { GetAccessTokenService } from '@app/ss-common-domain/user/auth/get.access-token.service';
import { ValidateAccessTokenService } from './auth/validate/validate.access-token.service';
import { SaveAccessTokenService } from './auth/save/save.access-token.service';
import { EncryptionService } from '@app/encryption';
import { CreateUserRepo } from './manage/create/create.user.repo';
import { GetUserRepo } from './manage/get/get.user.repo';
import { GetAccessTokenRepo } from '@app/ss-common-domain/user/auth/get.access-token.repo';
import { SaveAccessTokenRepo } from './auth/save/save.access-token.repo';
import { SaveSignInRequestRepo } from './auth/save/save-sign-in-request.repo';
import { GetSignInRequestService } from './auth/get/get.sign-in-request.service';
import { SaveSignInRequestService } from './auth/save/save.sign-in-request.service';
import { GetSignInRequestRepo } from './auth/get/get.sign-in-request.repo';
import { RevokeAccessTokenService } from './auth/revoke/revoke.access-token.service';
import { RevokeAccessTokenRepo } from './auth/revoke/revoke.access-token.repo';
import { UpdateUserService } from './manage/update/update.user.service';
import { UpdateUserRepo } from './manage/update/update.user.repo';
import { UserController } from './user.controller';
import * as process from 'node:process';
import { TerminusModule } from '@nestjs/terminus';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot(),
    MongooseModule.forFeature([
      {
        name: User.name,
        schema: UserSchema,
      },
      {
        name: AccessToken.name,
        schema: AccessTokenSchema,
      },
      {
        name: SignInRequest.name,
        schema: SignInRequestSchema,
      },
    ]),
    MongooseModule.forRoot(process.env.DB_CONNECTION, {
      dbName: 'quicklaunch-dev',
    }),
    PassportModule,
    JwtModule.register({
      global: true,
    }),
    TerminusModule,
    HttpModule, // This is required for HTTP health checks
  ],
  providers: [
    ManageUserAuthService,
    CreateUserService,
    GetUsersService,
    GetAccessTokenService,
    ValidateAccessTokenService,
    SaveAccessTokenService,
    EncryptionService,
    JwtService,
    CreateUserRepo,
    GetUserRepo,
    GetAccessTokenRepo,
    SaveAccessTokenRepo,
    SaveSignInRequestRepo,
    GetSignInRequestService,
    SaveSignInRequestService,
    GetSignInRequestRepo,
    RevokeAccessTokenService,
    RevokeAccessTokenRepo,
    UpdateUserService,
    UpdateUserRepo,
  ],
  controllers: [UserController],
  exports: [JwtModule, ManageUserAuthService],
})
export class UserModule {}
