import { Test, TestingModule } from '@nestjs/testing';
import { DatabaseService } from 'src/database/database.service';
import { MatchingService } from './matching.service';
import {
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';

function createOwnedPartsSelectChain<T>(result: T) {
  const where = jest.fn().mockResolvedValue(result);
  const from = jest.fn().mockReturnValue({ where });
  const select = jest.fn().mockReturnValue({ from });

  return { select, from, where };
}

describe('MatchingService', () => {
  let service: MatchingService;
  let ownedPartsChain: ReturnType<typeof createOwnedPartsSelectChain>;
  let execute: jest.Mock;

  const userId = '11111111-1111-1111-1111-111111111111';

  beforeEach(async () => {
    ownedPartsChain = createOwnedPartsSelectChain([]);
    execute = jest.fn().mockResolvedValue({ rows: [] });

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MatchingService,
        {
          provide: DatabaseService,
          useValue: {
            db: {
              select: ownedPartsChain.select,
              execute,
            },
          },
        },
      ],
    }).compile();

    service = module.get<MatchingService>(MatchingService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findMatches', () => {
    it('should return empty results when user owns no parts', async () => {
      ownedPartsChain.where.mockResolvedValue([]);
      const response = await service.findMatches(userId);

      expect(response).toEqual({
        data: { results: [] },
        meta: { count: 0, limit: 50 },
      });
      expect(ownedPartsChain.select).toHaveBeenCalled();
      expect(execute).not.toHaveBeenCalled();
    });

    it('should return empty results when no candidate sets match', async () => {
      ownedPartsChain.where.mockResolvedValue([
        { partNum: '3001', colorId: 4, quantity: 10 },
      ]);
      execute.mockResolvedValueOnce({ rows: [] });

      const response = await service.findMatches(userId);

      expect(response).toEqual({
        data: { results: [] },
        meta: { count: 0, limit: 50 },
      });

      expect(execute).toHaveBeenCalledTimes(1);
    });

    it('should return a 100% match with no missing parts', async () => {
      ownedPartsChain.where.mockResolvedValue([
        { partNum: '3001', colorId: 4, quantity: 10 },
        { partNum: '3002', colorId: 1, quantity: 5 },
      ]);

      execute
        .mockResolvedValueOnce({
          rows: [
            {
              set_num: '60000-1',
              set_name: 'Set A',
              year: 2020,
              theme_name: 'City',
              total_parts: 15,
              owned_parts: 15,
              match_percentage: 1,
            },
          ],
        })
        .mockResolvedValueOnce({ rows: [] });

      const response = await service.findMatches(userId, { limit: 10 });

      expect(response).toEqual({
        data: {
          results: [
            {
              setNum: '60000-1',
              setName: 'Set A',
              year: 2020,
              themeName: 'City',
              totalParts: 15,
              ownedParts: 15,
              matchPercentage: 1,
              missingParts: [],
            },
          ],
        },
        meta: { count: 1, limit: 10 },
      });
      expect(execute).toHaveBeenCalledTimes(2);
    });

    it('should return partial match with missing parts', async () => {
      ownedPartsChain.where.mockResolvedValue([
        { partNum: '3001', colorId: 4, quantity: 10 },
      ]);

      execute
        .mockResolvedValueOnce({
          rows: [
            {
              set_num: '60001-1',
              set_name: 'Set B',
              year: 2021,
              theme_name: 'Technic',
              total_parts: 21,
              owned_parts: 10,
              match_percentage: 0.47619047619047616,
            },
          ],
        })
        .mockResolvedValueOnce({
          rows: [
            {
              set_num: '60001-1',
              part_num: '3001',
              color_id: 4,
              part_name: 'Brick 2 x 4',
              color_name: 'Red',
              color_rgb: 'C91A09',
              color_is_trans: false,
              missing_qty: 10,
            },
            {
              set_num: '60001-1',
              part_num: '3003',
              color_id: 1,
              part_name: 'Brick 2 x 2',
              color_name: 'Blue',
              color_rgb: '0055BF',
              color_is_trans: false,
              missing_qty: 1,
            },
          ],
        });

      const response = await service.findMatches(userId);

      expect(response).toEqual({
        data: {
          results: [
            {
              setNum: '60001-1',
              setName: 'Set B',
              year: 2021,
              themeName: 'Technic',
              totalParts: 21,
              ownedParts: 10,
              matchPercentage: 0.47619047619047616,
              missingParts: [
                {
                  partNum: '3001',
                  colorId: 4,
                  quantity: 10,
                  partName: 'Brick 2 x 4',
                  colorName: 'Red',
                  colorRgb: 'C91A09',
                  colorIsTrans: false,
                },
                {
                  partNum: '3003',
                  colorId: 1,
                  quantity: 1,
                  partName: 'Brick 2 x 2',
                  colorName: 'Blue',
                  colorRgb: '0055BF',
                  colorIsTrans: false,
                },
              ],
            },
          ],
        },
        meta: { count: 1, limit: 50 },
      });
    });

    it('should use default limit of 50 when not specified', async () => {
      ownedPartsChain.where.mockResolvedValue([
        { partNum: '3001', colorId: 4, quantity: 1 },
      ]);
      execute.mockResolvedValue({ rows: [] });

      const response = await service.findMatches(userId);

      expect(response.meta.limit).toBe(50);
      expect(execute).toHaveBeenCalledTimes(1);
    });

    it('should not call missing-parts query when ranking returns no sets', async () => {
      ownedPartsChain.where.mockResolvedValue([
        { partNum: '3001', colorId: 4, quantity: 1 },
      ]);
      execute.mockResolvedValueOnce({ rows: [] });

      await service.findMatches(userId);

      expect(execute).toHaveBeenCalledTimes(1);
    });
  });

  describe('buildMissingPartsCsv', () => {
    it('should throw NotFoundException if set does not exist', async () => {
      execute.mockResolvedValueOnce({ rows: [] });
      await expect(
        service.buildMissingPartsCsv(userId, 'invalid-1'),
      ).rejects.toThrow(NotFoundException);
      expect(execute).toHaveBeenCalledTimes(1);
    });

    it('should return an empty CSV if set has no missing parts', async () => {
      execute
        .mockResolvedValueOnce({ rows: [{ '?column?': 1 }] })
        .mockResolvedValueOnce({ rows: [] });
      const csv = await service.buildMissingPartsCsv(userId, '60000-1');
      expect(csv).toBe('Part,Color,Quantity');
    });

    it('should return a CSV with the missing parts', async () => {
      execute
        .mockResolvedValueOnce({ rows: [{ '?column?': 1 }] })
        .mockResolvedValueOnce({
          rows: [
            {
              set_num: '60001-1',
              part_num: '3003',
              color_id: 1,
              part_name: 'Brick 2 x 2',
              color_name: 'Blue',
              color_rgb: '0055BF',
              color_is_trans: false,
              missing_qty: 2,
            },
          ],
        });
      const csv = await service.buildMissingPartsCsv(userId, '60001-1');
      expect(csv).toBe('Part,Color,Quantity\n3003,1,2');
      expect(execute).toHaveBeenCalledTimes(2);
    });
  });

  describe('buildSet', () => {
    it('should throw NotFoundException if set does not exist', async () => {
      execute.mockResolvedValueOnce({ rows: [] });

      await expect(service.buildSet(userId, 'invalid-1')).rejects.toThrow(
        NotFoundException,
      );
      expect(execute).toHaveBeenCalledTimes(1);
    });

    it('should throw UnprocessableEntityException if user is missing parts', async () => {
      execute
        .mockResolvedValueOnce({ rows: [{ '?column?': 1 }] })
        .mockResolvedValueOnce({
          rows: [{ can_build: false, parts_affected: 0 }],
        });

      await expect(service.buildSet(userId, '60001-1')).rejects.toThrow(
        UnprocessableEntityException,
      );
      expect(execute).toHaveBeenCalledTimes(2);
    });

    it('should return partsAffected when set is built successfully', async () => {
      execute
        .mockResolvedValueOnce({ rows: [{ '?column?': 1 }] })
        .mockResolvedValueOnce({
          rows: [{ can_build: true, parts_affected: 12 }],
        })
        .mockResolvedValueOnce({ rows: [] });

      const response = await service.buildSet(userId, '60001-1');

      expect(response).toEqual({ partsAffected: 12 });
      expect(execute).toHaveBeenCalledTimes(3);
    });
  });
});
