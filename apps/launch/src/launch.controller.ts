import { Controller, Get } from '@nestjs/common';
import { LaunchService } from './launch.service';
import {
  HealthCheck,
  HealthCheckService,
  HttpHealthIndicator,
} from '@nestjs/terminus';

@Controller()
export class LaunchController {
  constructor(
    private readonly launchService: LaunchService,
    private readonly health: HealthCheckService,
    private readonly http: HttpHealthIndicator,
  ) {}

  @Get()
  getHello(): string {
    return this.launchService.getHello();
  }

  @Get('mint-health')
  @HealthCheck()
  public async appStarted() {
    return this.health.check([
      () => this.http.pingCheck('solana stack', 'https://solscan.io/'),
    ]);
  }
}
