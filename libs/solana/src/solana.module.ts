import { Module } from '@nestjs/common';
import { CreateTokenAccountMintTokenService } from './spl/create-token-account-mint-token.service';
import { ConfigModule } from '@nestjs/config';
import { SolsUtils } from '@app/solana/utils/sols-utils.service';
import { MetadataService } from '@app/solana/metadata/metadata.service';
import { AwsModule } from '@app/aws';
import { EncryptionService } from '@app/encryption';

@Module({
  imports: [ConfigModule.forRoot(), AwsModule],
  providers: [
    CreateTokenAccountMintTokenService,
    SolsUtils,
    MetadataService,
    EncryptionService,
  ],
  exports: [
    CreateTokenAccountMintTokenService,
    SolsUtils,
    MetadataService,
    EncryptionService,
  ],
})
export class SolanaModule {}
