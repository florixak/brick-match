import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { OwnedPartsService } from './owned-parts.service';
import { CreateOwnedPartDto } from './dto/create-owned-part.dto';
import { UpdateOwnedPartDto } from './dto/update-owned-part.dto';

@Controller('owned-parts')
export class OwnedPartsController {
  constructor(private readonly ownedPartsService: OwnedPartsService) {}

  @Post()
  create(@Body() createOwnedPartDto: CreateOwnedPartDto) {
    return this.ownedPartsService.create(createOwnedPartDto);
  }

  @Get()
  findAll() {
    return this.ownedPartsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.ownedPartsService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateOwnedPartDto: UpdateOwnedPartDto) {
    return this.ownedPartsService.update(+id, updateOwnedPartDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.ownedPartsService.remove(+id);
  }
}
