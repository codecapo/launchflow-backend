import { Module } from '@nestjs/common';
import { SplCreateController } from './slice/spl/create/controller/spl.create.controller';
import { SplCreateRepo } from './slice/spl/create/repo/spl.create.repo';
import { SolanaModule } from '@app/solana';
import { SsCommonDomainModule } from '@app/ss-common-domain';
import { MongooseModule } from '@nestjs/mongoose';
import {
  User,
  UserSchema,
} from '@app/ss-common-domain/user/base/entity/user.entity';
import { MetadataController } from './slice/metadata/controller/metadata.controller';
import { EncryptionModule } from '@app/encryption';
import { SplCreateService } from './slice/spl/create/service/spl.create.service';

@Module({
  imports: [
    EncryptionModule,
    SolanaModule,
    SsCommonDomainModule,
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
  ],
  providers: [SplCreateRepo, SplCreateService],
  controllers: [SplCreateController, MetadataController],
  exports: [SplCreateRepo, SplCreateService],
})
export class MintModule {}
