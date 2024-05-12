import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
  SignInRequest,
  SignInRequestDocument,
} from '../../common/domain/entity/sign-in-request.entity';
import { Model } from 'mongoose';

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
