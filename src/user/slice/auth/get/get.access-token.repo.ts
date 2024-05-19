import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { AccessToken, AccessTokenDocument } from "../../../common/domain/entity/access-token.entity";
import { Model } from 'mongoose';

@Injectable()
export class GetAccessTokenRepo {
  constructor(
    @InjectModel(AccessToken.name) private accessTokenModel: Model<AccessTokenDocument>,
  ) {}
  async findAccessTokenByUserId(walletAddress: string): Promise<AccessToken> {
    return this.accessTokenModel.findOne({ userWalletAddress: walletAddress });
  }
}
