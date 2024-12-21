import { ManageUserAuthService } from './slice/auth/manage/manage.user-auth.service';
import {
  BadRequestException,
  Body,
  Controller,
  Logger,
  Post,
  UseGuards,
} from '@nestjs/common';
import { VerifySignInAuthRequestDto } from '@app/ss-common-domain/user/base/dto/verify-sign-in-auth-request.dto';
import { AuthGuard } from '@app/ss-common-domain/user/auth/auth.guard';
import { WebPubSubServiceClient } from '@azure/web-pubsub';
import { UpdateUserService } from './slice/manage/update/update.user.service';

interface UserAuthRequest {
  nonce: string;
}

interface NegotiateClientRequest {
  walletAddress: string;
  clientId: string;
}

interface Message {
  type: string;
  payload: string;
}

interface SendMessageRequest {
  uci: string;
  message: Message;
}

interface CloseConnectionRequest {
  uci: string;
  connectionId: string;
}

interface CloseConnectionResponse {
  resultMessage: string;
  result: boolean;
}

@Controller('depreciated/user')
export class UserController {
  private logger: Logger = new Logger(UserController.name);
  private webPubSubClient = new WebPubSubServiceClient(
    process.env.AZURE_WEB_PUBSUB_CLIENT_CONNECTION_URL,
    'solana_stack',
  );
  constructor(
    private readonly userAuthService: ManageUserAuthService,
    private readonly updateUserService: UpdateUserService,
  ) {}

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

  @UseGuards(AuthGuard)
  @Post('/negotiate')
  public async negotiateWebPubSub(
    @Body() negotiateClientRequest: NegotiateClientRequest,
  ) {
    const uniqueClientIdentifier = `${negotiateClientRequest.walletAddress}-${negotiateClientRequest.clientId}`;
    await this.updateUserService.saveUciOnLogin(
      negotiateClientRequest.walletAddress,
      uniqueClientIdentifier,
    );

    return await this.webPubSubClient.getClientAccessToken({
      userId: uniqueClientIdentifier,
    });
  }

  @UseGuards(AuthGuard)
  @Post('/close')
  public async closeConnection(
    @Body() closeConnectionRequest: CloseConnectionRequest,
  ) {
    const existInWebPubSub = await this.webPubSubClient.userExists(
      closeConnectionRequest.uci,
    );

    if (existInWebPubSub) {
      const isClosed = await this.webPubSubClient.userExists(
        closeConnectionRequest.connectionId,
      );

      if (isClosed) {
        const response: CloseConnectionResponse = {
          result: isClosed,
          resultMessage: `User ${closeConnectionRequest.uci} closed ${closeConnectionRequest.connectionId}`,
        };
        return response;
      } else {
        const response: CloseConnectionResponse = {
          result: isClosed,
          resultMessage: `Did not find connection for User ${closeConnectionRequest.uci} to close`,
        };
        return response;
      }
    }
  }

  @UseGuards(AuthGuard)
  @Post('/send-message')
  public async sendMessage(@Body() sendMessage: SendMessageRequest) {
    const stringifyMessage = JSON.stringify(sendMessage.message);
    await this.webPubSubClient.sendToUser(sendMessage.uci, stringifyMessage);
  }
}
