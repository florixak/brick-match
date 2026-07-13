import 'dotenv/config';
import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { Logger } from '@nestjs/common';
import { ImportModule } from './import.module';
import { ImportService } from './import.service';

const logger = new Logger('ImportCommand');

async function main() {
  const app = await NestFactory.createApplicationContext(ImportModule, {
    logger: ['log', 'warn', 'error'],
  });

  try {
    const importService = app.get(ImportService);
    await importService.importAll();
    process.exit(0);
  } catch (err) {
    logger.error(
      'Import failed',
      err instanceof Error ? err.stack : String(err),
    );
    process.exit(1);
  } finally {
    await app.close();
  }
}

main();
