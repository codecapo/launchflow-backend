import { InjectModel } from '@nestjs/mongoose';
import {
  AccessToken,
  AccessTokenDocument,
} from '../../../common/domain/entity/access-token.entity';
import { Model } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { AccessTokenRevoked } from '../../../common/domain/value/access-token-revoked';

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
