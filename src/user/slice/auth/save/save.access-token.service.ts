import { Injectable, Logger } from '@nestjs/common';
import { ManageUserAuthService } from '../manage/manage.user-auth.service';
import { SaveAccessTokenRepo } from './save.access-token.repo';
import { AccessToken } from '@app/ss-common-domain/user/entity/access-token.entity';

@Injectable()
export class SaveAccessTokenService {
  private logger: Logger = new Logger(ManageUserAuthService.name);

  constructor(private readonly createAccessTokenRepo: SaveAccessTokenRepo) {}

  async saveAccessToken(walletAddress: string, accessToken: string) {
    const currentTime = new Date(Date.now()).getTime();
    const expireTime = currentTime + 1000 * 60 * 60 * 8; // 8 hour;

    const saveAccessToken: AccessToken = {
      expiresAt: new Date(expireTime),
      accessToken: accessToken,
      userWalletAddress: walletAddress,
    };

    const accessTokenCreated =
      await this.createAccessTokenRepo.saveAccessToken(saveAccessToken);

    this.logger.log(`saved access token for user ${walletAddress}`);

    return accessTokenCreated;
  }

  async updateAccessToken(walletAddress: string, accessToken: string) {
    const currentTime = new Date(Date.now()).getTime();
    const expireTime = currentTime + 1000 * 60 * 60 * 8; // 8 hour;

    const saveAccessToken: AccessToken = {
      expiresAt: new Date(expireTime),
      accessToken: accessToken,
      userWalletAddress: walletAddress,
    };

    await this.createAccessTokenRepo.updateAccessToken(saveAccessToken);

    this.logger.log(`updated access token for user ${walletAddress}`);
  }
}
