import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

import { Model } from 'mongoose';
import {
  SignInRequest,
  SignInRequestDocument,
} from '@app/ss-common-domain/user/base/entity/sign-in-request.entity';
@Injectable()
export class GetSignInRequestRepo {
  constructor(
    @InjectModel(SignInRequest.name)
    private signInRequestModel: Model<SignInRequestDocument>,
  ) {}

  async getSignInRequestNonce(nounceText: string): Promise<SignInRequest> {
    return this.signInRequestModel.findOne({ nonce: nounceText });
  }

  async getSignInRequestById(id: string): Promise<SignInRequest> {
    return this.signInRequestModel.findById({ _id: id });
  }

  async getSignInRequestByPublicKey(publicKey: string): Promise<SignInRequest> {
    return this.signInRequestModel.findOne({ publicKey: publicKey });
  }
}
