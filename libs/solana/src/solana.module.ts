import { Module } from '@nestjs/common';
import { SerialisedCreateMintTokenService } from './spl/serialised-create-mint-token.service';
import { ConfigModule } from '@nestjs/config';
import { SolsUtils } from '@app/solana/utils/sols-utils.service';
import { MetadataService } from '@app/solana/metadata/metadata.service';
import { AwsModule } from '@app/aws';
import { EncryptionService } from '@app/encryption';
import { CreateMetadataService } from '@app/solana/metadata/create.metadata.service';
import { CreateNonceService } from '@app/solana/spl/create-nonce.service';
import { AdminCreateMintTokenService } from '@app/solana/spl/admin-create-mint-token.service';

@Module({
  imports: [ConfigModule.forRoot(), AwsModule],
  providers: [
    SerialisedCreateMintTokenService,
    CreateMetadataService,
    SolsUtils,
    MetadataService,
    EncryptionService,
    CreateNonceService,
    AdminCreateMintTokenService,
  ],
  exports: [
    SerialisedCreateMintTokenService,
    CreateMetadataService,
    SolsUtils,
    MetadataService,
    EncryptionService,
    CreateNonceService,
    AdminCreateMintTokenService,
  ],
})
export class SolanaModule {}
