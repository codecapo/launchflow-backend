import { InjectModel } from '@nestjs/mongoose';

import { Model } from 'mongoose';
import { Injectable } from '@nestjs/common';
import {
  AccessToken,
  AccessTokenDocument,
} from '@app/ss-common-domain/user/base/entity/access-token.entity';
import { AccessTokenRevoked } from '@app/ss-common-domain/user/base/value/access-token-revoked';

@Injectable()
export class RevokeAccessTokenRepo {
  constructor(
    @InjectModel(AccessToken.name)
    private accessTokenModel: Model<AccessTokenDocument>,
  ) {}

  async revokeAccessToken(walletAddress: string) {
    const revoke = await this.accessTokenModel.deleteOne({
      userWalletAddress: walletAddress,
    });

    return new AccessTokenRevoked(walletAddress, revoke.deletedCount > 0);
  }
}
