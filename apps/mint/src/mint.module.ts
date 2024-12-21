import { Module } from '@nestjs/common';
import { MintController } from './mint.controller';
import { MintService } from './mint.service';
import { TerminusModule } from '@nestjs/terminus';
import { MongooseModule } from '@nestjs/mongoose';
import { MintedToken, MintedTokenSchema } from './mint.schema';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot(),
    TerminusModule,
    MongooseModule.forFeature([
      { name: MintedToken.name, schema: MintedTokenSchema },
    ]),
    MongooseModule.forRoot(process.env.DB_CONNECTION, {
      dbName: 'quicklaunch-dev',
    }),
  ],
  controllers: [MintController],
  providers: [MintService],
})
export class MintModule {}
