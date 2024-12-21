import { NestFactory } from '@nestjs/core';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { MintModule } from './mint.module';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    MintModule,
    new FastifyAdapter(),
    {
      cors: {
        origin: '*', // Allows all origins
        methods: ['GET', 'PUT', 'POST', 'DELETE', 'OPTIONS', 'PATCH'],
        credentials: true,
      },
    },
  );
  await app.listen(4030);
}
bootstrap();
