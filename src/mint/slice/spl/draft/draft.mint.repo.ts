import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

import { Model } from 'mongoose';
import { ProjectToken } from '@app/ss-common-domain/mint/entity/project-token.entity';
import { User, UserDocument } from "@app/ss-common-domain/user/entity/user.entity";


@Injectable()
export class DraftMintRepo {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  public async draftMintForUser(
    walletAddress: string,
    projectToken: ProjectToken,
  ) {
    return this.userModel.updateOne(
      { publicKey: walletAddress },
      {
        $push: {
          projectTokens: [projectToken],
        },
      },
    );
  }
}
