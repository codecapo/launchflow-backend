import { RevokeAccessTokenRepo } from './revoke.access-token.repo';
import { Injectable } from '@nestjs/common';

@Injectable()
export class RevokeAccessTokenService {
  constructor(private readonly revokeAccessToken: RevokeAccessTokenRepo) {}
  async revoke(walletAddress: string) {
    return await this.revokeAccessToken.revokeAccessToken(walletAddress);
  }
}
