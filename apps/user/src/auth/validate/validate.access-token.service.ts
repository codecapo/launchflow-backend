import { Injectable, Logger } from '@nestjs/common';
import { GetAccessTokenService } from '@app/ss-common-domain/user/auth/get.access-token.service';
import { JwtService } from '@nestjs/jwt';
import { IsTokenExpiredValue } from '@app/ss-common-domain/user/base/value/is-token-expired.vo';

@Injectable()
export class ValidateAccessTokenService {
  private logger: Logger = new Logger(ValidateAccessTokenService.name);

  constructor(
    private readonly getAccessTokenService: GetAccessTokenService,
    private readonly jwtService: JwtService,
  ) {}

  async isAccessTokenExpired(userId: string): Promise<IsTokenExpiredValue> {
    const get = await this.getAccessTokenService.getAccessToken(userId);

    if (!get) {
      return { accessToken: null, isExpired: true };
    }

    try {
      if (get.accessToken) {
        const token = await this.jwtService.verifyAsync(get.accessToken, {
          secret: process.env.JWT_KEY,
        });

        const currentTime = new Date(Date.now()).getTime();

        const expireTime = currentTime + 1000 * 60 * 60 * 24;

        const valid = token.exp < Date.now() / expireTime;

        return { accessToken: token, isExpired: valid };
      }
    } catch (e) {
      new Error('JWT Expired');

      return { accessToken: null, isExpired: true };
    }
  }
}
