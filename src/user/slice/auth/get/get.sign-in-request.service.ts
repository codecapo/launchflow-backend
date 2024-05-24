import { GetSignInRequestRepo } from './get.sign-in-request.repo';
import { Injectable } from '@nestjs/common';
import { SignInRequest } from '@app/ss-common-domain/user/entity/sign-in-request.entity';

@Injectable()
export class GetSignInRequestService {
  constructor(private readonly getSignInRequestRepo: GetSignInRequestRepo) {}

  async getSignInRequest(nounceText: string): Promise<SignInRequest> {
    return await this.getSignInRequestRepo.getSignInRequest(nounceText);
  }

  async getSignInRequestById(id: string): Promise<SignInRequest> {
    return await this.getSignInRequestRepo.getSignInRequestById(id);
  }
}
