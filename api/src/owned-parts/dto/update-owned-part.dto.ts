import { PartialType } from '@nestjs/swagger';
import { CreateOwnedPartDto } from './create-owned-part.dto';

export class UpdateOwnedPartDto extends PartialType(CreateOwnedPartDto) {}
