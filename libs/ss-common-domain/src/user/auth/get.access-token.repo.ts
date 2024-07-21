import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

import { Model } from 'mongoose';
import {
  AccessToken,
  AccessTokenDocument,
} from '@app/ss-common-domain/user/base/entity/access-token.entity';

@Injectable()
export class GetAccessTokenRepo {
  constructor(
    @InjectModel(AccessToken.name)
    private accessTokenModel: Model<AccessTokenDocument>,
  ) {}
  async findAccessTokenByUserId(walletAddress: string): Promise<AccessToken> {
    return this.accessTokenModel.findOne({ userWalletAddress: walletAddress });
  }
}
