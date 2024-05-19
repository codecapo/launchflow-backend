import { Module } from '@nestjs/common';
import { ManageUserAuthService } from './slice/auth/manage/manage.user-auth.service';
import { UserController } from './user.controller';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { EncryptionService } from '@app/encryption';
import { ValidateAccessTokenService } from './slice/auth/validate/validate.access-token.service';
import { GetAccessTokenService } from './slice/auth/get/get.access-token.service';
import { GetUsersService } from './slice/manage/get/get.user.service';
import { CreateUserService } from './slice/manage/create/create.user.service';
import { CreateUserRepo } from './slice/manage/create/create.user.repo';
import { GetUserRepo } from './slice/manage/get/get.user.repo';
import { GetAccessTokenRepo } from './slice/auth/get/get.access-token.repo';
import { SaveAccessTokenRepo } from './slice/auth/save/save.access-token.repo';
import { SaveAccessTokenService } from './slice/auth/save/save.access-token.service';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './common/domain/entity/user.entity';
import {
  AccessToken,
  AccessTokenSchema,
} from './common/domain/entity/access-token.entity';
import { PassportModule } from '@nestjs/passport';
import { SaveSignInRequestRepo } from './slice/auth/save/save-sign-in-request.repo';
import {
  SignInRequest,
  SignInRequestSchema,
} from './common/domain/entity/sign-in-request.entity';
import { GetSignInRequestService } from "./slice/auth/get/get.sign-in-request.service";
import { SaveSignInRequestService } from "./slice/auth/save/save.sign-in-request.service";
import { GetSignInRequestRepo } from "./slice/auth/get/get.sign-in-request.repo";
import { RevokeAccessTokenService } from "./slice/auth/revoke/revoke.access-token.service";
import { RevokeAccessTokenRepo } from "./slice/auth/revoke/revoke.access-token.repo";

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
  ],
  controllers: [UserController],
  exports: [JwtModule],
})
export class UserModule {}
