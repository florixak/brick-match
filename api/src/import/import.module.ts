import { Module } from '@nestjs/common';
import { AppConfigModule } from '../config/config.module';
import { DatabaseModule } from '../database/database.module';
import { ImportService } from './import.service';

@Module({
  imports: [AppConfigModule, DatabaseModule],
  providers: [ImportService],
  exports: [ImportService],
})
export class ImportModule {}
