import { Injectable } from '@nestjs/common';
import { CreateOwnedPartDto } from './dto/create-owned-part.dto';
import { UpdateOwnedPartDto } from './dto/update-owned-part.dto';

@Injectable()
export class OwnedPartsService {
  create(createOwnedPartDto: CreateOwnedPartDto) {
    return 'This action adds a new ownedPart';
  }

  findAll() {
    return `This action returns all ownedParts`;
  }

  findOne(id: number) {
    return `This action returns a #${id} ownedPart`;
  }

  update(id: number, updateOwnedPartDto: UpdateOwnedPartDto) {
    return `This action updates a #${id} ownedPart`;
  }

  remove(id: number) {
    return `This action removes a #${id} ownedPart`;
  }
}
