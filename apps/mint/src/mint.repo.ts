import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { MintedToken, MintedTokenDocument } from './mint.schema';
import { Model } from 'mongoose';

@Injectable()
export class MintRepo {
  private logger: Logger = new Logger(MintRepo.name);

  constructor(
    @InjectModel(MintedToken.name)
    private mintedTokenModel: Model<MintedTokenDocument>,
  ) {}

  public async createToken(mintedToken: MintedToken) {
    try {
      return await this.mintedTokenModel.create(mintedToken);
    } catch (e) {
      throw e;
    }
  }
}
