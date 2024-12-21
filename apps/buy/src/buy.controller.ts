import { Controller, Get } from '@nestjs/common';
import { BuyService } from './buy.service';
import { HealthCheck, HealthCheckService, HttpHealthIndicator } from '@nestjs/terminus';

@Controller()
export class BuyController {
  constructor(
    private readonly buyService: BuyService,
    private readonly health: HealthCheckService,
    private readonly http: HttpHealthIndicator,
  ) {}

  @Get()
  getHello(): string {
    return this.buyService.getHello();
  }

  @Get('buy-health')
  @HealthCheck()
  public async appStarted() {
    return this.health.check([
      () => this.http.pingCheck('solana stack', 'https://solscan.io/'),
    ]);
  }
}
