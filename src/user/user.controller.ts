import { ManageUserAuthService } from './slice/auth/manage/manage.user-auth.service';
import {
  BadRequestException,
  Body,
  Controller,
  Logger,
  Post,
} from '@nestjs/common';
import { VerifySignInAuthRequestDto } from '@app/ss-common-domain/user/base/dto/verify-sign-in-auth-request.dto';

interface UserAuthRequest {
  nonce: string;
}

@Controller('user')
export class UserController {
  private logger: Logger = new Logger(UserController.name);
  constructor(private userAuthService: ManageUserAuthService) {}

  @Post('auth')
  async createAuthRequest(@Body() authRequest: UserAuthRequest) {
    return await this.userAuthService.userSignIn(authRequest.nonce);
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
