import { Model } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
  User,
  UserDocument,
} from '@app/ss-common-domain/user/base/entity/user.entity';

@Injectable()
export class GetUserRepo {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}
  async getUsers(): Promise<User[]> {
    return this.userModel.find();
  }
  async getUser(walletAddress: string): Promise<User> {
    return this.userModel.findOne({ publicKey: walletAddress });
  }
}
