import { SaveSignInRequestRepo } from './save-sign-in-request.repo';
import { SaveSignInRequestDto } from '../../../common/domain/dto/save-sign-in-request.dto';
import { Injectable } from '@nestjs/common';

@Injectable()
export class SaveSignInRequestService {
  constructor(private readonly saveSignInRequestRepo: SaveSignInRequestRepo) {}

  async saveSignInRequest(signInRequest: SaveSignInRequestDto) {
    return await this.saveSignInRequestRepo.saveSignInRequest(signInRequest);
  }
}
