import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

import { Model } from 'mongoose';
import { SignInRequest, SignInRequestDocument } from "@app/ss-common-domain/user/entity/sign-in-request.entity";
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
