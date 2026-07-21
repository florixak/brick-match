import { Test, TestingModule } from '@nestjs/testing';
import { OwnedPartsController } from './owned-parts.controller';
import { OwnedPartsService } from './owned-parts.service';

describe('OwnedPartsController', () => {
  let controller: OwnedPartsController;
  let ownedPartsService: {
    create: jest.Mock;
    addSet: jest.Mock;
    findAll: jest.Mock;
    remove: jest.Mock;
  };

  const userId = '11111111-1111-1111-1111-111111111111';

  beforeEach(async () => {
    ownedPartsService = {
      create: jest.fn(),
      addSet: jest.fn(),
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

  it('should add all parts from a set', async () => {
    const request = { setNum: '6030-1' };
    const mockResponse = {
      parts: [
        { partNum: '3001', colorId: 1, quantity: 5 },
        { partNum: '3003', colorId: 15, quantity: 2 },
      ],
    };
    ownedPartsService.addSet.mockResolvedValue(mockResponse);

    const result = await controller.addSet(userId, request);

    expect(ownedPartsService.addSet).toHaveBeenCalledWith(userId, {
      setNum: '6030-1',
    });
    expect(result).toEqual({
      data: mockResponse,
      meta: {},
    });
  });

  it('should create an owned part', async () => {
    const request = {
      partNum: '3001',
      colorId: 1,
      quantity: 4,
    };
    ownedPartsService.create.mockResolvedValue(request);

    const result = await controller.create(userId, request);

    expect(ownedPartsService.create).toHaveBeenCalledWith(userId, request);
    expect(result).toEqual({
      data: request,
      meta: {},
    });
  });

  it('should list owned parts', async () => {
    const query = {
      page: 1,
      pageSize: 50,
      search: 'brick',
    };
    const mockResponse = {
      data: {
        items: [
          {
            partNum: '3001',
            colorId: 0,
            quantity: 4,
            partName: 'Brick 2 x 4',
            colorName: 'Black',
            colorRgb: '05131D',
            partCategoryId: 11,
            partCategoryName: 'Bricks',
          },
        ],
      },
      meta: {
        page: 1,
        limit: 50,
        totalItems: 1,
        totalPages: 1,
      },
    };
    ownedPartsService.findAll.mockResolvedValue(mockResponse);

    const result = await controller.findAll(userId, query);

    expect(ownedPartsService.findAll).toHaveBeenCalledWith(userId, query);
    expect(result).toEqual(mockResponse);
  });

  it('should remove an owned part', async () => {
    const query = {
      partNum: '03231pr0001',
      colorId: 0,
    };
    ownedPartsService.remove.mockResolvedValue(undefined);

    await expect(controller.remove(userId, query)).resolves.toBeUndefined();

    expect(ownedPartsService.remove).toHaveBeenCalledWith(
      userId,
      '03231pr0001',
      0,
    );
  });
});
