import { Logger, Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { TerminusModule } from '@nestjs/terminus';
import { HttpModule } from '@nestjs/axios';
import { MintModule } from './mint/mint.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: '.env' }),
    MongooseModule.forRoot(process.env.DB_CONNECTION, {
      dbName: 'test',
    }),
    UserModule,
    TerminusModule,
    HttpModule,
    MintModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {
  private logger = new Logger('AppModule');
  constructor() {
    this.logger.log(`Solana Stack is ${process.env.ENVIRONMENT}`);
    this.logger.log(
      `Solana Stack connected to ${process.env.CHAIN_ID} network`,
    );
  }
}
