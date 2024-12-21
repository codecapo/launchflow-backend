import { Module } from '@nestjs/common';
import { RunController } from './run.controller';
import { RunService } from './run.service';
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
  controllers: [RunController],
  providers: [RunService],
})
export class RunModule {}
