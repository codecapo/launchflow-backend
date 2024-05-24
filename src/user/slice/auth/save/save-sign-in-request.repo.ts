import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

import { Model } from 'mongoose';
import { SignInRequest, SignInRequestDocument } from "@app/ss-common-domain/user/entity/sign-in-request.entity";

@Injectable()
export class SaveSignInRequestRepo {
  constructor(
    @InjectModel(SignInRequest.name)
    private signInRequestModel: Model<SignInRequestDocument>,
  ) {}

  async saveSignInRequest(
    signInRequest: SignInRequest,
  ): Promise<SignInRequest> {
    const newSignInRequest = new this.signInRequestModel(signInRequest);
    return newSignInRequest.save();
  }
}
