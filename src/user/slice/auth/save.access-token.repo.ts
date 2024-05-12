import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { AccessToken, AccessTokenDocument } from "../../common/domain/entity/access-token.entity";
import { Model } from 'mongoose';

@Injectable()
export class SaveAccessTokenRepo {
  constructor(
    @InjectModel(AccessToken.name) private accessTokenModel: Model<AccessTokenDocument>,
  ) {}

  async saveAccessToken(accessToken: AccessToken): Promise<AccessToken> {

    return this.accessTokenModel.create(accessToken);
  }
}
