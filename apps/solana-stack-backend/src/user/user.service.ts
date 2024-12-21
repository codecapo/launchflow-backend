import { Injectable, Logger } from '@nestjs/common';
import { WebPubSubServiceClient } from '@azure/web-pubsub';

@Injectable()
export class UserService {
  private logger: Logger = new Logger(UserService.name);
  private webPubSubClient = new WebPubSubServiceClient(
    process.env.AZURE_WEB_PUBSUB_CLIENT_CONNECTION_URL,
    'solana_stack',
  );

  constructor() {}
  public async closeUserConnections(uci:string, clientConnectionId: string ) {

    // do we need to save the connectionId in the backend?

    const existInWebPubSub = await this.webPubSubClient.userExists(uci)

    if (existInWebPubSub) {
      const isClosed = await this.webPubSubClient.userExists(clientConnectionId)
      return
    }
  }
}
