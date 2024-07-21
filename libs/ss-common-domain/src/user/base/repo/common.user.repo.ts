import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

import { Model } from 'mongoose';
import {
  User,
  UserDocument,
} from '@app/ss-common-domain/user/base/entity/user.entity';

@Injectable()
export class CommonUserRepo {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  public async findUserByWalletAddress(walletAddress: string): Promise<User> {
    return this.userModel.findOne({ publicKey: walletAddress });
  }
}
