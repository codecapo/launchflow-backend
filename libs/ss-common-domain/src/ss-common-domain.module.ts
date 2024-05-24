import { Module } from '@nestjs/common';
import { SsCommonDomainService } from './ss-common-domain.service';
import { CommonUserService } from '@app/ss-common-domain/user/service/common.user.service';
import { CommonUserRepo } from '@app/ss-common-domain/user/repo/common.user.repo';
import { MongooseModule } from '@nestjs/mongoose';
import {
  User,
  UserSchema,
} from '@app/ss-common-domain/user/entity/user.entity';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
  ],
  providers: [SsCommonDomainService, CommonUserService, CommonUserRepo],
  exports: [SsCommonDomainService, CommonUserService, CommonUserRepo],
})
export class SsCommonDomainModule {}
