import { Module } from '@nestjs/common';
import { SplMintController } from './slice/spl/create/controller/spl.mint.controller';
import { CreateTokenMintAccountRepo } from './slice/spl/create/repo/create.token-mint-account.repo';
import { SolanaModule } from '@app/solana';
import { SsCommonDomainModule } from '@app/ss-common-domain';
import { MongooseModule } from '@nestjs/mongoose';
import {
  User,
  UserSchema,
} from '@app/ss-common-domain/user/entity/user.entity';
import { MetadataController } from './slice/metadata/controller/metadata.controller';
import { DraftMintController } from './slice/spl/draft/draft.mint.controller';
import { DraftMintService } from './slice/spl/draft/draft.mint.service';
import { EncryptionModule } from '@app/encryption';
import { DraftMintRepo } from './slice/spl/draft/draft.mint.repo';

@Module({
  imports: [
    EncryptionModule,
    SolanaModule,
    SsCommonDomainModule,
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
  ],
  providers: [CreateTokenMintAccountRepo, DraftMintService, DraftMintRepo],
  controllers: [SplMintController, MetadataController, DraftMintController],
  exports: [CreateTokenMintAccountRepo, DraftMintService, DraftMintRepo],
})
export class MintModule {}
