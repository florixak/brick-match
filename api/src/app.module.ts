import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AppConfigModule } from './config/config.module';
import { DatabaseModule } from './database/database.module';
import { CatalogModule } from './catalog/catalog.module';
import { AuthModule } from './auth/auth.module';
import { MatchingModule } from './matching/matching.module';
import { OwnedPartsModule } from './owned-parts/owned-parts.module';

@Module({
  imports: [
    AppConfigModule,
    DatabaseModule,
    CatalogModule,
    OwnedPartsModule,
    MatchingModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
