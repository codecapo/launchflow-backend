import { Injectable } from '@nestjs/common';
import { GetAccessTokenRepo } from './get.access-token.repo';
import { AccessToken } from '../../../common/domain/entity/access-token.entity';

@Injectable()
export class GetAccessTokenService {
  constructor(private readonly getAccessTokenRepo: GetAccessTokenRepo) {}
  async getAccessToken(userWalletAddress: string): Promise<AccessToken> {
    return await this.getAccessTokenRepo.findAccessTokenByUserId(
      userWalletAddress,
    );
  }
}
