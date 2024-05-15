import { GetSignInRequestRepo } from './get.sign-in-request.repo';
import { Injectable } from '@nestjs/common';

@Injectable()
export class GetSignInRequestService {
  constructor(private readonly getSignInRequestRepo: GetSignInRequestRepo) {}

  async getSignInRequest(nounceText: string) {
    return await this.getSignInRequestRepo.getSignInRequest(nounceText);
  }

  async getSignInRequestById(id: string) {
    return await this.getSignInRequestRepo.getSignInRequestById(id);
  }
}
