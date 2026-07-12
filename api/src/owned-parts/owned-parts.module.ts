import { Module } from '@nestjs/common';
import { OwnedPartsService } from './owned-parts.service';
import { OwnedPartsController } from './owned-parts.controller';

@Module({
  controllers: [OwnedPartsController],
  providers: [OwnedPartsService],
})
export class OwnedPartsModule {}
