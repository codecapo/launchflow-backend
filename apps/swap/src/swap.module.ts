import { Module } from '@nestjs/common';
import { SwapController } from './swap.controller';
import { SwapService } from './swap.service';
import { TerminusModule } from '@nestjs/terminus';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot(),
    TerminusModule,
    MongooseModule.forRoot(process.env.DB_CONNECTION, {
      dbName: 'quicklaunch-dev',
    }),
  ],
  controllers: [SwapController],
  providers: [SwapService],
})
export class SwapModule {}
