import { InjectModel } from '@nestjs/mongoose';

import { Model } from 'mongoose';
import { Injectable } from '@nestjs/common';
import {
  User,
  UserDocument,
} from '@app/ss-common-domain/user/entity/user.entity';
import { ProjectTokenInfo } from '@app/ss-common-domain/mint/entity/project-token-info.entity';

@Injectable()
export class CreateTokenMintAccountRepo {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  public async createTokenMintAccount(
    walletAddress: string,
    projectInfo: ProjectTokenInfo,
    projectMintPubKey: string,
  ): Promise<User> {
    return this.userModel.findOneAndUpdate(
      {
        publicKey: walletAddress,
        'projectTokens.mintKeys.mintPubKey': projectMintPubKey,
      },
      { 'projectTokens.projectTokenInfo': projectInfo },
    );
  }
}
