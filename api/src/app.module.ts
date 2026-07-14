import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AppConfigModule } from './config/config.module';
import { DatabaseModule } from './database/database.module';
import { CatalogModule } from './catalog/catalog.module';
import { AuthModule } from './auth/auth.module';
import { MatchingModule } from './matching/matching.module';
import { OwnedPartsModule } from './owned-parts/owned-parts.module';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { RATE_LIMITS } from './config/rate-limit.config';
import { APP_GUARD } from '@nestjs/core';

@Module({
  imports: [
    AppConfigModule,
    DatabaseModule,
    ThrottlerModule.forRoot([
      { name: 'default', ...RATE_LIMITS.default },
      { name: 'auth', ...RATE_LIMITS.auth },
      { name: 'matching', ...RATE_LIMITS.matching },
    ]),
    CatalogModule,
    OwnedPartsModule,
    MatchingModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService, { provide: APP_GUARD, useClass: ThrottlerGuard }],
})
export class AppModule {}
