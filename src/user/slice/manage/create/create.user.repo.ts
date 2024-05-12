import { Model } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from '../../../common/domain/entity/user.entity';

@Injectable()
export class CreateUserRepo {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}
  async createUser(user: User): Promise<User> {
    const createdUser = new this.userModel(user);
    return await createdUser.save();
  }
}
