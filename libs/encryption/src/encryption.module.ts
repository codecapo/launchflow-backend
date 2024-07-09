import { Module } from '@nestjs/common';
import { EncryptionService } from './encryption.service';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [ConfigModule.forRoot()],
  providers: [EncryptionService, ConfigService],
  exports: [EncryptionService],
})
export class EncryptionModule {}
