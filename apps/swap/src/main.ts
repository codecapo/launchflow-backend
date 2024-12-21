import { NestFactory } from '@nestjs/core';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { SwapModule } from './swap.module';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    SwapModule,
    new FastifyAdapter(),
    {
      cors: {
        origin: '*', // Allows all origins
        methods: ['GET', 'PUT', 'POST', 'DELETE', 'OPTIONS', 'PATCH'],
        credentials: true,
      },
    },
  );
  await app.listen(4010); // Added host parameter for broader accessibility
}
bootstrap();
