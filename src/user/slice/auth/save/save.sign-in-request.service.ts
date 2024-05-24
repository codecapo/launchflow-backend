import { SaveSignInRequestRepo } from './save-sign-in-request.repo';
import { Injectable } from '@nestjs/common';
import { SaveSignInRequestDto } from '@app/ss-common-domain/user/dto/save-sign-in-request.dto';

@Injectable()
export class SaveSignInRequestService {
  constructor(private readonly saveSignInRequestRepo: SaveSignInRequestRepo) {}

  async saveSignInRequest(signInRequest: SaveSignInRequestDto) {
    return await this.saveSignInRequestRepo.saveSignInRequest(signInRequest);
  }
}
