import { UserAuthService } from './slice/auth/service/user-auth.service';
import {
  Body,
  Controller,
  Get,
  Post,
} from '@nestjs/common';
interface VerifyAuthRequest {
  publicKey: any;
  signature: any;
  message: any;
}

@Controller('user')
export class UserController {
  constructor(private userAuthSiwsService: UserAuthService) {}

  @Get('sign-in')
  async createSignInRequest() {
    console.log('sign-in');

    return this.userAuthSiwsService.userSignIn();
  }

  @Post('auth')
  async walletAuthRequest(@Body() verifyAuthRequest: VerifyAuthRequest) {
    console.log(verifyAuthRequest);

    return this.userAuthSiwsService.verifySignIn(
      verifyAuthRequest.message,
      verifyAuthRequest.signature,
      verifyAuthRequest.publicKey,
    );
  }
}
