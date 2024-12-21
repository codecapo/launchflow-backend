import { InjectModel } from '@nestjs/mongoose';

import { Model } from 'mongoose';
import { Injectable } from '@nestjs/common';
import {
  User,
  UserDocument,
} from '@app/ss-common-domain/user/base/entity/user.entity';

@Injectable()
export class UpdateUserRepo {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async addUCI(walletAddress: string, uci: string) {
    await this.userModel.updateOne({publicKey: walletAddress}, {
      $push: {
        uci: uci,
      },
    })
  }
}
