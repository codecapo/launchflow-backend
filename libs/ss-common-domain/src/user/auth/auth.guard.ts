import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { GetAccessTokenService } from './get.access-token.service';

@Injectable()
export class AuthGuard implements CanActivate {
  private readonly logger: Logger = new Logger(AuthGuard.name);

  constructor(
    private readonly jwtService: JwtService,
    private readonly getAccessTokenService: GetAccessTokenService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);
    if (!token) {
      throw new UnauthorizedException({
        error: 'Access token is invalid, please provide access token',
      });
    }

    const payload = await this.jwtService.verifyAsync(token, {
      secret: process.env.JWT_KEY,
    });

    const get = await this.getAccessTokenService.getAccessToken(payload.pk);

    const isMatch = token === get.accessToken;

    if (isMatch) {
      this.logger.debug('User authenticated endpoint successfully');
      return true;
    } else {
      throw new UnauthorizedException({
        message: 'Access token invalid please login to issue new access token',
      });
    }
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers['authorization']?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
