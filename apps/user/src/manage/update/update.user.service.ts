import { Injectable, Logger } from '@nestjs/common';
import { UpdateUserRepo } from './update.user.repo';
import { WebPubSubServiceClient } from '@azure/web-pubsub';

@Injectable()
export class UpdateUserService {
  private readonly logger = new Logger(UpdateUserService.name);

  private webPubSubClient = new WebPubSubServiceClient(
    process.env.AZURE_WEB_PUBSUB_CLIENT_CONNECTION_URL,
    'solana_stack',
  );

  constructor(private readonly updateUserRepo: UpdateUserRepo) {}

  public async saveUciOnLogin(walletAddress: string, uci: string) {
    await this.updateUserRepo.addUCI(walletAddress, uci);
  }
}
