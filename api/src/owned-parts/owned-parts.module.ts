import { Module } from '@nestjs/common';
import { OwnedPartsService } from './owned-parts.service';
import { OwnedPartsController } from './owned-parts.controller';
import { DatabaseModule } from 'src/database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [OwnedPartsController],
  providers: [OwnedPartsService],
})
export class OwnedPartsModule {}
