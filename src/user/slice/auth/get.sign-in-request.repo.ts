import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
  SignInRequest,
  SignInRequestDocument,
} from '../../common/domain/entity/sign-in-request.entity';
import { Model } from 'mongoose';
@Injectable()
export class GetSignInRequestRepo {
  constructor(
    @InjectModel(SignInRequest.name)
    private signInRequestModel: Model<SignInRequestDocument>,
  ) {}

  async getSignInRequest(nounceText: string): Promise<SignInRequest> {
    return this.signInRequestModel.findOne({ nounce: nounceText });
  }

  async getSignInRequestById(id: string): Promise<SignInRequest> {
    return this.signInRequestModel.findById({ _id: id });
  }
}
