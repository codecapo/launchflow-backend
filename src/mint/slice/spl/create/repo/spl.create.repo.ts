import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Injectable, Logger } from '@nestjs/common';
import {
  User,
  UserDocument,
} from '@app/ss-common-domain/user/base/entity/user.entity';
import { CreateMintTokenWithProjectInfoDto } from '@app/ss-common-domain/user/base/dto/create-mint-token-with-project-info.dto';
import { ProjectToken } from '@app/ss-common-domain/mint/entity/project-token.entity';

@Injectable()
export class SplCreateRepo {
  private readonly logger: Logger = new Logger(SplCreateRepo.name);
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  public async addCreatedAndMintedSplTokenToUserProfile(
    createMintTokenWithProjectInfoDto: CreateMintTokenWithProjectInfoDto,
  ): Promise<User> {
    const projectToken: ProjectToken = {
      description: createMintTokenWithProjectInfoDto.description,
      metadataUri: createMintTokenWithProjectInfoDto.metadataUri,
      mintAuthPrivKey: createMintTokenWithProjectInfoDto.mintAuthPrivKey,
      mintAuthPubKey: createMintTokenWithProjectInfoDto.mintAuthPubKey,
      mintPrivKey: createMintTokenWithProjectInfoDto.mintPrivKey,
      mintPubKey: createMintTokenWithProjectInfoDto.mintPubKey,
      name: createMintTokenWithProjectInfoDto.name,
      supply: createMintTokenWithProjectInfoDto.supply,
      symbol: createMintTokenWithProjectInfoDto.symbol,
      type: createMintTokenWithProjectInfoDto.type,
    };

    const res = await this.userModel.updateOne(
      { publicKey: createMintTokenWithProjectInfoDto.userWalletAddress },
      {
        $push: {
          projectTokens: projectToken,
        },
      },
    );

    if (res.modifiedCount >= 1) {
      this.logger.log(`Token updated on user profile ${res.modifiedCount}`);
      return this.userModel.findOne({
        publicKey: createMintTokenWithProjectInfoDto.userWalletAddress,
      });
    } else {
      this.logger.warn('Mint Token did not update on user profile', res);
      return;
    }
  }
}
