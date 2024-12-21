import { NestFactory } from '@nestjs/core';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { RunModule } from './run.module';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    RunModule,
    new FastifyAdapter(),
  );
  await app.listen(4020);
}
bootstrap();
