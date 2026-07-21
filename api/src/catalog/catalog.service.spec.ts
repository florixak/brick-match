import { Test, TestingModule } from '@nestjs/testing';
import { CatalogService } from './catalog.service';
import { DatabaseService } from 'src/database/database.service';

function createSelectChain<T>(result: T) {
  const limit = jest.fn().mockResolvedValue(result);
  const orderBy = jest.fn().mockReturnValue({ limit });
  const where = jest.fn().mockReturnValue({ orderBy });
  const innerJoin = jest.fn().mockReturnValue({ where });
  const from = jest.fn().mockReturnValue({ where, innerJoin });
  const select = jest.fn().mockReturnValue({ from });

  return { select, from, innerJoin, where, orderBy, limit };
}

function createListSelectChain<T>(result: T) {
  const orderBy = jest.fn().mockResolvedValue(result);
  const from = jest.fn().mockReturnValue({ orderBy });
  const select = jest.fn().mockReturnValue({ from });

  return { select, from, orderBy };
}

describe('CatalogService', () => {
  let service: CatalogService;
  let selectChain: ReturnType<typeof createSelectChain>;

  beforeEach(async () => {
    selectChain = createSelectChain([]);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CatalogService,
        {
          provide: DatabaseService,
          useValue: {
            db: {
              select: selectChain.select,
            },
          },
        },
      ],
    }).compile();

    service = module.get<CatalogService>(CatalogService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('searchSets', () => {
    it('should search sets by name', async () => {
      const mockSets = [
        {
          setNum: '70500-1',
          name: "Kai's Fire Mech",
          year: 2013,
          numParts: 102,
          themeId: 435,
          themeName: 'Ninjago',
        },
      ];
      selectChain.limit.mockResolvedValue(mockSets);

      const result = await service.searchSets({
        search: "Kai's Fire Mech",
        limit: 10,
      });

      expect(result.data.sets).toHaveLength(1);
      expect(result.data.sets[0].setNum).toBe('70500-1');
      expect(result.data.sets[0].name).toBe("Kai's Fire Mech");
      expect(result.data.sets[0].year).toBe(2013);
      expect(result.data.sets[0].numParts).toBe(102);
      expect(result.data.sets[0].themeId).toBe(435);
      expect(result.data.sets[0].themeName).toBe('Ninjago');
      expect(result.meta).toEqual({ count: 1, limit: 10 });
      expect(selectChain.select).toHaveBeenCalled();
      expect(selectChain.innerJoin).toHaveBeenCalled();
      expect(selectChain.limit).toHaveBeenCalledWith(10);
    });

    it('should return empty sets when search is blank', async () => {
      const result = await service.searchSets({ limit: 10 });

      expect(result.data.sets).toEqual([]);
      expect(result.meta).toEqual({ count: 0, limit: 10 });
      expect(selectChain.select).not.toHaveBeenCalled();
    });

    it('should search sets by set number', async () => {
      const mockSets = [
        {
          setNum: '9441-1',
          name: "Kai's Blade Cycle",
          year: 2012,
          numParts: 188,
          themeId: 435,
          themeName: 'Ninjago',
        },
      ];
      selectChain.limit.mockResolvedValue(mockSets);

      const result = await service.searchSets({
        search: '9441',
        limit: 10,
      });

      expect(result.data.sets).toHaveLength(1);
      expect(result.data.sets[0].setNum).toBe('9441-1');
      expect(result.data.sets[0].name).toBe("Kai's Blade Cycle");
      expect(result.data.sets[0].year).toBe(2012);
      expect(result.data.sets[0].numParts).toBe(188);
      expect(result.data.sets[0].themeId).toBe(435);
      expect(result.data.sets[0].themeName).toBe('Ninjago');
      expect(selectChain.select).toHaveBeenCalled();
      expect(selectChain.innerJoin).toHaveBeenCalled();
      expect(selectChain.limit).toHaveBeenCalledWith(10);
    });
  });

  describe('searchParts', () => {
    it('should return empty parts when search is blank', async () => {
      const result = await service.searchParts({ limit: 10 });

      expect(result.data.parts).toEqual([]);
      expect(result.meta).toEqual({ count: 0, limit: 10 });
      expect(selectChain.select).not.toHaveBeenCalled();
    });

    it('should search parts by name', async () => {
      const mockParts = [
        {
          partNum: '3835',
          name: 'Weapon Axe',
        },
        {
          partNum: '39802',
          name: 'Weapon Axe',
        },
        {
          partNum: '4438',
          name: 'Weapon Axe (Fabuland)',
        },
      ];
      selectChain.limit.mockResolvedValue(mockParts);

      const result = await service.searchParts({
        search: 'Weapon',
        limit: 10,
      });

      expect(result.data.parts).toHaveLength(3);
      expect(result.data.parts[0].partNum).toBe('3835');
      expect(result.data.parts[0].name).toBe('Weapon Axe');
      expect(result.data.parts[1].partNum).toBe('39802');
      expect(result.data.parts[1].name).toBe('Weapon Axe');
      expect(result.data.parts[2].partNum).toBe('4438');
      expect(result.data.parts[2].name).toBe('Weapon Axe (Fabuland)');
      expect(selectChain.select).toHaveBeenCalled();
      expect(selectChain.limit).toHaveBeenCalledWith(10);
    });

    it('should search parts by part number', async () => {
      const mockParts = [
        {
          partNum: '21459',
          name: 'Weapon Sword / Katana / Shamshir with Capped Pommel [Square Guard]',
        },
      ];
      selectChain.limit.mockResolvedValue(mockParts);

      const result = await service.searchParts({
        search: '21459',
        limit: 10,
      });

      expect(result.data.parts).toHaveLength(1);
      expect(result.data.parts[0].partNum).toBe('21459');
      expect(result.data.parts[0].name).toBe(
        'Weapon Sword / Katana / Shamshir with Capped Pommel [Square Guard]',
      );
      expect(selectChain.select).toHaveBeenCalled();
      expect(selectChain.limit).toHaveBeenCalledWith(10);
    });
  });

  describe('getColors', () => {
    it('should get colors', async () => {
      const listChain = createListSelectChain([
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
      ]);
      selectChain.select.mockImplementation(listChain.select);

      const result = await service.getColors();

      expect(result.data.colors).toHaveLength(2);
      expect(result.data.colors[0].colorId).toBe(1);
      expect(result.data.colors[0].name).toBe('Blue');
      expect(result.data.colors[1].colorId).toBe(15);
      expect(result.meta).toEqual({ count: 2 });
      expect(listChain.select).toHaveBeenCalled();
      expect(listChain.orderBy).toHaveBeenCalled();
    });
  });

  describe('getThemes', () => {
    it('should get themes', async () => {
      const listChain = createListSelectChain([
        {
          id: 1,
          name: 'Ninjago',
        },
      ]);
      selectChain.select.mockImplementation(listChain.select);

      const result = await service.getThemes();

      expect(result.data.themes).toHaveLength(1);
      expect(result.data.themes[0].id).toBe(1);
      expect(result.data.themes[0].name).toBe('Ninjago');
      expect(result.meta).toEqual({ count: 1 });
      expect(listChain.select).toHaveBeenCalled();
      expect(listChain.orderBy).toHaveBeenCalled();
    });
  });

  describe('getPartCategories', () => {
    it('should get part categories', async () => {
      const listChain = createListSelectChain([
        {
          id: 11,
          name: 'Bricks',
        },
        {
          id: 19,
          name: 'Plates',
        },
      ]);
      selectChain.select.mockImplementation(listChain.select);

      const result = await service.getPartCategories();

      expect(result.data.partCategories).toHaveLength(2);
      expect(result.data.partCategories[0].id).toBe(11);
      expect(result.data.partCategories[0].name).toBe('Bricks');
      expect(result.data.partCategories[1].id).toBe(19);
      expect(result.data.partCategories[1].name).toBe('Plates');
      expect(result.meta).toEqual({ count: 2 });
      expect(listChain.select).toHaveBeenCalled();
      expect(listChain.orderBy).toHaveBeenCalled();
    });
  });
});
