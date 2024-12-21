import { NestFactory } from '@nestjs/core';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { UserModule } from './user.module';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    UserModule,
    new FastifyAdapter(),
    {
      cors: {
        origin: '*', // Allows all origins
        methods: ['GET', 'PUT', 'POST', 'DELETE', 'OPTIONS', 'PATCH'],
        credentials: true,
      },
    },
  );
  await app.listen(4000); // Added host parameter for broader accessibility
}
bootstrap();
