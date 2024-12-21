import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Post,
} from '@nestjs/common';
import { MintService } from './mint.service';
import { CreateMintTokenRequest } from './mint.dto';
import {
  HealthCheck,
  HealthCheckService,
  HttpHealthIndicator,
} from '@nestjs/terminus';

@Controller('mint')
export class MintController {
  constructor(
    private readonly mintService: MintService,
    private health: HealthCheckService,
    private http: HttpHealthIndicator,
  ) {}

  @Get('mint-health')
  @HealthCheck()
  public async appStarted() {
    return this.health.check([
      () => this.http.pingCheck('solana stack', 'https://solscan.io/'),
    ]);
  }

  @Post('meme')
  async createMemeToken(
    @Body() createMintTokenRequest: CreateMintTokenRequest,
  ) {
    try {
      return await this.mintService.createMemeToken(createMintTokenRequest);
    } catch (e) {
      throw new BadRequestException({
        message: 'Could not revoke mint authority',
        status: 400,
      });
    }
  }

  @Post('utility')
  async createUtilityToken(
    @Body() createMintTokenRequest: CreateMintTokenRequest,
  ) {
    try {
      return await this.mintService.createUtilityToken(createMintTokenRequest);
    } catch (e) {
      throw new BadRequestException({
        message: 'Could not revoke mint authority',
        status: 400,
      });
    }
  }
}
