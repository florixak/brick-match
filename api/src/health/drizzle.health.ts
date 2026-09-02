import { Injectable } from '@nestjs/common';
import { HealthIndicatorService } from '@nestjs/terminus';
import { sql } from 'drizzle-orm';
import { DatabaseService } from '../database/database.service';

@Injectable()
export class DrizzleHealthIndicator {
  constructor(
    private readonly database: DatabaseService,
    private readonly healthIndicatorService: HealthIndicatorService,
  ) {}

  async isHealthy(key: string) {
    const indicator = this.healthIndicatorService.check(key);

    try {
      await this.database.db.execute(sql`SELECT 1`);
      return indicator.up();
    } catch (error) {
      return indicator.down({
        message:
          error instanceof Error ? error.message : 'Unknown database error',
      });
    }
  }
}
