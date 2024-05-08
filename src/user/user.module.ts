import { Module } from '@nestjs/common';
import { UserAuthService } from './slice/auth/service/user-auth.service';
import { UserController } from './user.controller';

@Module({
  imports: [],
  providers: [UserAuthService],
  controllers: [UserController],
})
export class UserModule {}
