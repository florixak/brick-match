import { Injectable } from '@nestjs/common';
import { AppConfigService } from '../config/config.service';
import { createDatabaseConnection, Database } from './database-connection';

@Injectable()
export class DatabaseService {
  readonly db: Database;

  constructor(config: AppConfigService) {
    this.db = createDatabaseConnection(config.databaseUrl);
  }
}
