import { Controller, Get } from '@nestjs/common';
import { RunService } from './run.service';
import {
  HealthCheck,
  HealthCheckService,
  HttpHealthIndicator,
} from '@nestjs/terminus';

@Controller()
export class RunController {
  constructor(
    private readonly runService: RunService,
    private readonly health: HealthCheckService,
    private readonly http: HttpHealthIndicator,
  ) {}

  @Get()
  getHello(): string {
    return this.runService.getHello();
  }

  @Get('run-health')
  @HealthCheck()
  public async appStarted() {
    return this.health.check([
      () => this.http.pingCheck('solana stack', 'https://solscan.io/'),
    ]);
  }
}
