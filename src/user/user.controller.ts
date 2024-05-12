import { UserAuthService } from './slice/auth/user-auth.service';
import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Logger,
  Post,
} from '@nestjs/common';
import { VerifySignInAuthRequestDto } from './common/domain/dto/verify-sign-in-auth-request.dto';

@Controller('user')
export class UserController {
  private logger: Logger = new Logger(UserController.name);
  constructor(private userAuthService: UserAuthService) {}

  @Get('auth')
  async createAuthRequest() {
    return this.userAuthService.userSignIn();
  }

  @Post('sign-in')
  async signInRequest(
    @Body() verifySignInAuthRequest: VerifySignInAuthRequestDto,
  ) {
    if (!verifySignInAuthRequest)
      throw new BadRequestException('Please ensure all fields are provided');

    const verified = await this.userAuthService.verifyWalletSignIn(
      verifySignInAuthRequest.message,
      verifySignInAuthRequest.signature,
      verifySignInAuthRequest.publicKey,
    );

    return await this.userAuthService.manageJwt(
      verified,
      verifySignInAuthRequest.publicKey,
    );
  }
}
