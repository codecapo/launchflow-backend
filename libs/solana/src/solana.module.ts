import { Module } from '@nestjs/common';
import { CreateTokenAccountMintTokenService } from './spl/create-token-account-mint-token.service';
import { ConfigModule } from '@nestjs/config';
import { SolsUtils } from '@app/solana/utils/sols-utils.service';

@Module({
  imports: [ConfigModule.forRoot()],
  providers: [CreateTokenAccountMintTokenService, SolsUtils],
  exports: [CreateTokenAccountMintTokenService, SolsUtils],
})
export class SolanaModule {}
