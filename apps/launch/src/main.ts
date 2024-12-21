import { NestFactory } from '@nestjs/core';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { LaunchModule } from './launch.module';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    LaunchModule,
    new FastifyAdapter(),
    {
      cors: {
        origin: '*', // Allows all origins
        methods: ['GET', 'PUT', 'POST', 'DELETE', 'OPTIONS', 'PATCH'],
        credentials: true,
      },
    },
  );
  await app.listen(4040);
}
bootstrap();
