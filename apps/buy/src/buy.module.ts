import { Module } from '@nestjs/common';
import { BuyController } from './buy.controller';
import { BuyService } from './buy.service';
import { TerminusModule } from '@nestjs/terminus';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [
    ConfigModule.forRoot(),
    TerminusModule,
    MongooseModule.forRoot(process.env.DB_CONNECTION, {
      dbName: 'quicklaunch-dev',
    }),
  ],
  controllers: [BuyController],
  providers: [BuyService],
})
export class BuyModule {}
