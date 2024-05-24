import { Module } from '@nestjs/common';
import { SplMintController } from './slice/spl/create/controller/SplMintController';
import { CreateTokenMintAccountService } from './slice/spl/create/service/create.token-mint-account.service';
import { CreateTokenMintAccountRepo } from './slice/spl/create/repo/create.token-mint-account.repo';
import { CreateMintTokenSupplyService } from './slice/spl/create/service/create.mint-token-supply.service';
import { SolanaModule } from '@app/solana';
import { SsCommonDomainModule } from '@app/ss-common-domain';
import { MongooseModule } from '@nestjs/mongoose';
import {
  User,
  UserSchema,
} from '@app/ss-common-domain/user/entity/user.entity';

@Module({
  imports: [
    SolanaModule,
    SsCommonDomainModule,
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
  ],
  providers: [
    CreateTokenMintAccountService,
    CreateTokenMintAccountRepo,
    CreateMintTokenSupplyService,
  ],
  controllers: [SplMintController],
  exports: [
    CreateTokenMintAccountService,
    CreateTokenMintAccountRepo,
    CreateMintTokenSupplyService,
  ],
})
export class MintModule {}
