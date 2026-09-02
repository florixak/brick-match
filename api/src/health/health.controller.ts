import { Controller, Get, VERSION_NEUTRAL } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';
import { HealthCheck, HealthCheckService } from '@nestjs/terminus';
import { SkipThrottle } from '@nestjs/throttler';
import { DrizzleHealthIndicator } from './drizzle.health';

@SkipThrottle()
@Controller({ path: 'health', version: VERSION_NEUTRAL })
export class HealthController {
  constructor(
    private readonly health: HealthCheckService,
    private readonly drizzle: DrizzleHealthIndicator,
  ) {}

  @Get('live')
  @HealthCheck()
  @ApiOperation({ summary: 'Check if the server is live' })
  live() {
    return this.health.check([]);
  }

  @Get('ready')
  @HealthCheck()
  @ApiOperation({ summary: 'Check if the database is healthy' })
  ready() {
    return this.health.check([() => this.drizzle.isHealthy('database')]);
  }
}
