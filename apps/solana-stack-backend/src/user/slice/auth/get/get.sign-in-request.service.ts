import { GetSignInRequestRepo } from './get.sign-in-request.repo';
import { Injectable } from '@nestjs/common';
import { SignInRequest } from '@app/ss-common-domain/user/base/entity/sign-in-request.entity';

@Injectable()
export class GetSignInRequestService {
  constructor(private readonly getSignInRequestRepo: GetSignInRequestRepo) {}

  async getSignInRequestByNonce(nounceText: string): Promise<SignInRequest> {
    return await this.getSignInRequestRepo.getSignInRequestNonce(nounceText);
  }

  async getSignInRequestById(id: string): Promise<SignInRequest> {
    return await this.getSignInRequestRepo.getSignInRequestById(id);
  }

  async getSignInRequestByPublicKey(pubkey: string): Promise<SignInRequest> {
    return await this.getSignInRequestRepo.getSignInRequestByPublicKey(pubkey);
  }
}
