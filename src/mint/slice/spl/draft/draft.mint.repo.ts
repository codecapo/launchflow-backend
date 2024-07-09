import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

import { Model } from 'mongoose';
import { ProjectToken } from '@app/ss-common-domain/mint/entity/project-token.entity';
import {
  User,
  UserDocument,
} from '@app/ss-common-domain/user/entity/user.entity';

@Injectable()
export class DraftMintRepo {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  public async draftMintForUser(
    walletAddress: string,
    projectToken: ProjectToken,
  ) {
    console.log(walletAddress);
    console.log(projectToken);

    const user = await this.userModel.findOne({ publicKey: walletAddress });



    const res = this.userModel.updateOne(
      { publicKey: walletAddress },
      {
        $push: {
          projectTokens: [projectToken],
        },
      },
    );

    return res;
  }
}
