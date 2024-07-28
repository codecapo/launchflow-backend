import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { AppService } from './app.service';
import {
  HealthCheck,
  HealthCheckService,
  HttpHealthIndicator,
} from '@nestjs/terminus';
import { WebPubSubServiceClient } from '@azure/web-pubsub';
import { AuthGuard } from '@app/ss-common-domain/user/auth/auth.guard';

interface NegotiateClientRequest {
  walletAddress: string;
}

interface SendMessageRequest {
  walletAddress: string;
  message: string;
}

@Controller()
export class AppController {
  private webPubSubClient = new WebPubSubServiceClient(
    process.env.AZURE_WEB_PUBSUB_CLIENT_CONNECTION_URL,
    'solana_stack',
  );

  private token = this.webPubSubClient.getClientAccessToken({
    expirationTimeInMinutes: 100000,
  });

  constructor(
    private readonly appService: AppService,
    private health: HealthCheckService,
    private http: HttpHealthIndicator,
  ) {}

  @Get('health')
  @HealthCheck()
  public async appStarted() {
    return this.health.check([
      () => this.http.pingCheck('solana stack', 'https://solscan.io/'),
    ]);
  }

  @UseGuards(AuthGuard)
  @Post('/negotiate')
  public async negotiateWebPubSub(
    @Body() negotiateClientRequest: NegotiateClientRequest,
  ) {
    console.log(negotiateClientRequest);
    return await this.webPubSubClient.getClientAccessToken({
      userId: negotiateClientRequest.walletAddress,
    });
  }

  @UseGuards(AuthGuard)
  @Post('/send-message')
  public async sendMessage(@Body() sendMessage: SendMessageRequest) {
    console.log(sendMessage);
    await this.webPubSubClient.sendToUser(
      sendMessage.walletAddress,
      sendMessage.message,
    );
  }
}
