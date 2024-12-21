import { NestFactory } from '@nestjs/core';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { BuyModule } from './buy.module';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    BuyModule,
    new FastifyAdapter(),
    {
      cors: {
        origin: '*', // Allows all origins
        methods: ['GET', 'PUT', 'POST', 'DELETE', 'OPTIONS', 'PATCH'],
        credentials: true,
      },
    },
  );
  await app.listen(4050);
}
bootstrap();
