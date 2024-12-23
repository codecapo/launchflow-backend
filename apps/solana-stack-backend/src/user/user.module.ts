import { Module } from '@nestjs/common';
import { ManageUserAuthService } from './slice/auth/manage/manage.user-auth.service';
import { UserController } from './user.controller';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { EncryptionService } from '@app/encryption';
import { ValidateAccessTokenService } from './slice/auth/validate/validate.access-token.service';
import { GetAccessTokenService } from '@app/ss-common-domain/user/auth/get.access-token.service';
import { GetUsersService } from './slice/manage/get/get.user.service';
import { CreateUserService } from './slice/manage/create/create.user.service';
import { CreateUserRepo } from './slice/manage/create/create.user.repo';
import { GetUserRepo } from './slice/manage/get/get.user.repo';
import { GetAccessTokenRepo } from '@app/ss-common-domain/user/auth/get.access-token.repo';
import { SaveAccessTokenRepo } from './slice/auth/save/save.access-token.repo';
import { SaveAccessTokenService } from './slice/auth/save/save.access-token.service';
import { MongooseModule } from '@nestjs/mongoose';

import { PassportModule } from '@nestjs/passport';
import { SaveSignInRequestRepo } from './slice/auth/save/save-sign-in-request.repo';

import { GetSignInRequestService } from './slice/auth/get/get.sign-in-request.service';
import { SaveSignInRequestService } from './slice/auth/save/save.sign-in-request.service';
import { GetSignInRequestRepo } from './slice/auth/get/get.sign-in-request.repo';
import { RevokeAccessTokenService } from './slice/auth/revoke/revoke.access-token.service';
import { RevokeAccessTokenRepo } from './slice/auth/revoke/revoke.access-token.repo';
import {
  AccessToken,
  AccessTokenSchema,
} from '@app/ss-common-domain/user/base/entity/access-token.entity';
import {
  SignInRequest,
  SignInRequestSchema,
} from '@app/ss-common-domain/user/base/entity/sign-in-request.entity';
import {
  User,
  UserSchema,
} from '@app/ss-common-domain/user/base/entity/user.entity';
import { UpdateUserService } from './slice/manage/update/update.user.service';
import { UpdateUserRepo } from './slice/manage/update/update.user.repo';

@Module({
  imports: [
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
    PassportModule,
    JwtModule.register({
      global: true,
    }),
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
