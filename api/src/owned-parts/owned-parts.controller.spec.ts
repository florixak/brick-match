import { Test, TestingModule } from '@nestjs/testing';
import { OwnedPartsController } from './owned-parts.controller';
import { OwnedPartsService } from './owned-parts.service';

describe('OwnedPartsController', () => {
  let controller: OwnedPartsController;
  let ownedPartsService: {
    create: jest.Mock;
    findAll: jest.Mock;
    remove: jest.Mock;
  };

  beforeEach(async () => {
    ownedPartsService = {
      create: jest.fn(),
      findAll: jest.fn(),
      remove: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [OwnedPartsController],
      providers: [
        {
          provide: OwnedPartsService,
          useValue: ownedPartsService,
        },
      ],
    }).compile();

    controller = module.get<OwnedPartsController>(OwnedPartsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
