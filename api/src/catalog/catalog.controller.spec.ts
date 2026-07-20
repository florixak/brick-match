import { Test, TestingModule } from '@nestjs/testing';
import { CatalogController } from './catalog.controller';
import { CatalogService } from './catalog.service';

describe('CatalogController', () => {
  let controller: CatalogController;
  let catalogService: {
    searchSets: jest.Mock;
    searchParts: jest.Mock;
    getColors: jest.Mock;
    getThemes: jest.Mock;
  };

  beforeEach(async () => {
    catalogService = {
      searchSets: jest.fn(),
      searchParts: jest.fn(),
      getColors: jest.fn(),
      getThemes: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [CatalogController],
      providers: [
        {
          provide: CatalogService,
          useValue: catalogService,
        },
      ],
    }).compile();

    controller = module.get<CatalogController>(CatalogController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should search sets', async () => {
    const mockResponse = {
      data: {
        sets: [
          {
            setNum: '9441-1',
            name: "Kai's Blade Cycle",
            year: 2012,
            numParts: 188,
            themeId: 435,
            themeName: 'Ninjago',
          },
        ],
      },
      meta: { count: 1, limit: 10 },
    };
    catalogService.searchSets.mockResolvedValue(mockResponse);

    const result = await controller.getSets({ search: '9441', limit: 10 });

    expect(catalogService.searchSets).toHaveBeenCalledWith({
      search: '9441',
      limit: 10,
    });
    expect(result).toEqual(mockResponse);
  });

  it('should search parts', async () => {
    const mockResponse = {
      data: {
        parts: [
          {
            partNum: '21459',
            name: 'Weapon Sword / Katana / Shamshir with Capped Pommel [Square Guard]',
          },
        ],
      },
      meta: { count: 1, limit: 10 },
    };
    catalogService.searchParts.mockResolvedValue(mockResponse);

    const result = await controller.getParts({ search: '21459', limit: 10 });

    expect(catalogService.searchParts).toHaveBeenCalledWith({
      search: '21459',
      limit: 10,
    });
    expect(result).toEqual(mockResponse);
  });

  it('should get colors', async () => {
    const mockResponse = {
      data: {
        colors: [
          {
            colorId: 1,
            name: 'Blue',
            rgb: '0055BF',
            isTrans: false,
          },
          {
            colorId: 15,
            name: 'Trans-Light Blue',
            rgb: 'AEEFEC',
            isTrans: true,
          },
        ],
      },
      meta: { count: 2 },
    };
    catalogService.getColors.mockResolvedValue(mockResponse);

    const result = await controller.getColors();

    expect(catalogService.getColors).toHaveBeenCalledWith();
    expect(result).toEqual(mockResponse);
  });

  it('should get themes', async () => {
    const mockResponse = {
      data: {
        themes: [
          {
            id: 1,
            name: 'Ninjago',
            parentId: null,
          },
        ],
      },
      meta: { count: 1 },
    };
    catalogService.getThemes.mockResolvedValue(mockResponse);
    const result = await controller.getThemes();
    expect(catalogService.getThemes).toHaveBeenCalledWith();
    expect(result).toEqual(mockResponse);
  });
});
