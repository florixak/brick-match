import { Test, TestingModule } from '@nestjs/testing';
import { OwnedPartsController } from './owned-parts.controller';
import { OwnedPartsService } from './owned-parts.service';

describe('OwnedPartsController', () => {
  let controller: OwnedPartsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OwnedPartsController],
      providers: [OwnedPartsService],
    }).compile();

    controller = module.get<OwnedPartsController>(OwnedPartsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
