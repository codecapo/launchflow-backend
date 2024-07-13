import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

import { Model } from 'mongoose';
import { AccessToken, AccessTokenDocument } from "@app/ss-common-domain/user/entity/access-token.entity";

@Injectable()
export class SaveAccessTokenRepo {
  constructor(
    @InjectModel(AccessToken.name)
    private accessTokenModel: Model<AccessTokenDocument>,
  ) {}

  async saveAccessToken(accessToken: AccessToken): Promise<AccessToken> {
    return this.accessTokenModel.create(accessToken);
  }

  async updateAccessToken(access: AccessToken): Promise<void> {
    await this.accessTokenModel.updateOne(
      { userWalletAddress: access.userWalletAddress },
      {
        $set: { accessToken: access.accessToken, expiresAt: access.expiresAt },
      },
      { upsert: true },
    );
  }
}
