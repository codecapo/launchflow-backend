import { Controller, Get } from '@nestjs/common';
import { SwapService } from './swap.service';
import { HealthCheck, HealthCheckService, HttpHealthIndicator } from '@nestjs/terminus';

@Controller()
export class SwapController {
  constructor(
    private readonly swapService: SwapService,
    private health: HealthCheckService,
    private http: HttpHealthIndicator,
  ) {}

  @Get()
  getHello(): string {
    return this.swapService.getHello();
  }

  @Get('swap-health')
  @HealthCheck()
  public async appStarted() {
    return this.health.check([
      () => this.http.pingCheck('solana stack', 'https://solscan.io/'),
    ]);
  }
}
