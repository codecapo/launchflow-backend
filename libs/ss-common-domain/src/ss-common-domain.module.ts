import { Module } from '@nestjs/common';
import { SsCommonDomainService } from './ss-common-domain.service';
import { CommonUserService } from '@app/ss-common-domain/user/base/service/common.user.service';
import { CommonUserRepo } from '@app/ss-common-domain/user/base/repo/common.user.repo';
import { MongooseModule } from '@nestjs/mongoose';
import {
  User,
  UserSchema,
} from '@app/ss-common-domain/user/base/entity/user.entity';
import { AuthGuard } from '@app/ss-common-domain/user/auth/auth.guard';
import { GetAccessTokenService } from '@app/ss-common-domain/user/auth/get.access-token.service';
import { GetAccessTokenRepo } from '@app/ss-common-domain/user/auth/get.access-token.repo';
import {
  AccessToken,
  AccessTokenSchema,
} from '@app/ss-common-domain/user/base/entity/access-token.entity';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: AccessToken.name, schema: AccessTokenSchema },
    ]),
  ],
  providers: [
    SsCommonDomainService,
    CommonUserService,
    CommonUserRepo,
    AuthGuard,
    GetAccessTokenRepo,
    GetAccessTokenService,
  ],
  exports: [
    SsCommonDomainService,
    CommonUserService,
    CommonUserRepo,
    AuthGuard,
    GetAccessTokenRepo,
    GetAccessTokenService,
  ],
})
export class SsCommonDomainModule {}
