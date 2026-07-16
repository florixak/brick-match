import type {
  AddOwnedPartResponse,
  GetOwnedPartsQuery,
  OwnedPartDetail,
} from '@lego-matcher/shared-types';
import {
  BadRequestException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { DatabaseService } from 'src/database/database.service';
import { OwnedPartsService } from './owned-parts.service';

function createInsertChain<T>(result: T[]) {
  const returning = jest.fn().mockResolvedValue(result);
  const onConflictDoUpdate = jest.fn().mockReturnValue({ returning });
  const values = jest.fn().mockReturnValue({ onConflictDoUpdate });
  const insert = jest.fn().mockReturnValue({ values });

  return { insert, values, onConflictDoUpdate, returning };
}

function createCountSelectChain(result: { count: number }[]) {
  const where = jest.fn().mockResolvedValue(result);
  const innerJoin = jest.fn().mockReturnValue({ where });
  const from = jest.fn().mockReturnValue({ innerJoin });
  const select = jest.fn().mockReturnValue({ from });

  return { select, from, innerJoin, where };
}

function createFindAllSelectChain<T>(result: T) {
  const offset = jest.fn().mockResolvedValue(result);
  const limit = jest.fn().mockReturnValue({ offset });
  const orderBy = jest.fn().mockReturnValue({ limit });
  const where = jest.fn().mockReturnValue({ orderBy });
  const innerJoinColors = jest.fn().mockReturnValue({ where });
  const innerJoinParts = jest
    .fn()
    .mockReturnValue({ innerJoin: innerJoinColors });
  const from = jest.fn().mockReturnValue({ innerJoin: innerJoinParts });
  const select = jest.fn().mockReturnValue({ from });

  return {
    select,
    from,
    innerJoinParts,
    innerJoinColors,
    where,
    orderBy,
    limit,
    offset,
  };
}

function createDeleteChain<T>(result: T[]) {
  const returning = jest.fn().mockResolvedValue(result);
  const where = jest.fn().mockReturnValue({ returning });
  const deleteFn = jest.fn().mockReturnValue({ where });

  return { delete: deleteFn, where, returning };
}

describe('OwnedPartsService', () => {
  let service: OwnedPartsService;
  let insertChain: ReturnType<typeof createInsertChain>;
  let countChain: ReturnType<typeof createCountSelectChain>;
  let listChain: ReturnType<typeof createFindAllSelectChain>;
  let deleteChain: ReturnType<typeof createDeleteChain>;
  let select: jest.Mock;
  let execute: jest.Mock;

  const userId = '11111111-1111-1111-1111-111111111111';

  beforeEach(async () => {
    insertChain = createInsertChain([]);
    countChain = createCountSelectChain([{ count: 0 }]);
    listChain = createFindAllSelectChain([]);
    deleteChain = createDeleteChain([]);
    execute = jest.fn().mockResolvedValue({ rows: [] });

    select = jest
      .fn()
      .mockImplementationOnce(countChain.select)
      .mockImplementationOnce(listChain.select);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OwnedPartsService,
        {
          provide: DatabaseService,
          useValue: {
            db: {
              insert: insertChain.insert,
              select,
              delete: deleteChain.delete,
              execute,
            },
          },
        },
      ],
    }).compile();

    service = module.get<OwnedPartsService>(OwnedPartsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create an owned part', async () => {
      const expectedResult: AddOwnedPartResponse = {
        partNum: '3001',
        colorId: 1,
        quantity: 4,
      };

      insertChain.returning.mockResolvedValue([expectedResult]);

      const result = await service.create(userId, {
        partNum: '3001',
        colorId: 1,
        quantity: 4,
      });

      expect(result).toEqual(expectedResult);
      expect(insertChain.insert).toHaveBeenCalled();
      expect(insertChain.values).toHaveBeenCalledWith({
        userId,
        partNum: '3001',
        colorId: 1,
        quantity: 4,
      });
      expect(insertChain.onConflictDoUpdate).toHaveBeenCalled();
      expect(insertChain.returning).toHaveBeenCalled();
    });

    it('should throw BadRequestException when part or color is not in catalog', async () => {
      insertChain.returning.mockRejectedValue({ code: '23503' });

      await expect(
        service.create(userId, {
          partNum: 'unknown',
          colorId: 999,
          quantity: 1,
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw InternalServerErrorException when insert returns no row', async () => {
      insertChain.returning.mockResolvedValue([]);

      await expect(
        service.create(userId, {
          partNum: '3001',
          colorId: 1,
          quantity: 1,
        }),
      ).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe('addSet', () => {
    it('should add all parts from a set', async () => {
      execute.mockResolvedValue({
        rows: [
          { part_num: '3001', color_id: 1, quantity: 5 },
          { part_num: '3003', color_id: 15, quantity: 2 },
        ],
      });

      const result = await service.addSet(userId, { setNum: '6030-1' });

      expect(result).toEqual({
        parts: [
          { partNum: '3001', colorId: 1, quantity: 5 },
          { partNum: '3003', colorId: 15, quantity: 2 },
        ],
      });
      expect(execute).toHaveBeenCalled();
    });

    it('should throw NotFoundException when set has no inventory parts', async () => {
      execute.mockResolvedValue({ rows: [] });

      await expect(
        service.addSet(userId, { setNum: 'unknown-1' }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException when part or color is not in catalog', async () => {
      execute.mockRejectedValue({ code: '23503' });

      await expect(
        service.addSet(userId, { setNum: '6030-1' }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('findAll', () => {
    const mockItems: OwnedPartDetail[] = [
      {
        partNum: '3001',
        colorId: 1,
        quantity: 4,
        partName: 'Brick 2 x 4',
        colorName: 'Blue',
        colorRgb: '0055BF',
      },
      {
        partNum: '3003',
        colorId: 15,
        quantity: 2,
        partName: 'Brick 2 x 2',
        colorName: 'Trans-Light Blue',
        colorRgb: 'AEEFEC',
      },
    ];

    it('should return paginated owned parts without search', async () => {
      countChain.where.mockResolvedValue([{ count: 2 }]);
      listChain.offset.mockResolvedValue(mockItems);

      const query: GetOwnedPartsQuery = {
        page: 1,
        pageSize: 50,
      };

      await expect(service.findAll(userId, query)).resolves.toEqual({
        data: { items: mockItems },
        meta: {
          page: 1,
          limit: 50,
          totalItems: 2,
          totalPages: 1,
        },
      });
      expect(select).toHaveBeenCalledTimes(2);
      expect(countChain.select).toHaveBeenCalled();
      expect(listChain.select).toHaveBeenCalled();
      expect(listChain.limit).toHaveBeenCalledWith(50);
      expect(listChain.offset).toHaveBeenCalledWith(0);
      expect(listChain.orderBy).toHaveBeenCalled();
    });

    it('should return paginated owned parts with search', async () => {
      countChain.where.mockResolvedValue([{ count: 1 }]);
      listChain.offset.mockResolvedValue([mockItems[0]]);

      const query: GetOwnedPartsQuery = {
        page: 1,
        pageSize: 10,
        search: 'brick',
      };

      await expect(service.findAll(userId, query)).resolves.toEqual({
        data: { items: [mockItems[0]] },
        meta: {
          page: 1,
          limit: 10,
          totalItems: 1,
          totalPages: 1,
        },
      });
      expect(select).toHaveBeenCalledTimes(2);
      expect(countChain.where).toHaveBeenCalled();
      expect(listChain.where).toHaveBeenCalled();
    });

    it('should calculate pagination for later pages', async () => {
      countChain.where.mockResolvedValue([{ count: 25 }]);
      listChain.offset.mockResolvedValue([mockItems[0]]);

      const query: GetOwnedPartsQuery = {
        page: 2,
        pageSize: 10,
      };

      await expect(service.findAll(userId, query)).resolves.toMatchObject({
        meta: {
          page: 2,
          limit: 10,
          totalItems: 25,
          totalPages: 3,
        },
      });
      expect(listChain.limit).toHaveBeenCalledWith(10);
      expect(listChain.offset).toHaveBeenCalledWith(10);
    });

    it('should return zero total pages when there are no items', async () => {
      countChain.where.mockResolvedValue([{ count: 0 }]);
      listChain.offset.mockResolvedValue([]);

      const query: GetOwnedPartsQuery = {
        page: 1,
        pageSize: 50,
      };

      await expect(service.findAll(userId, query)).resolves.toEqual({
        data: { items: [] },
        meta: {
          page: 1,
          limit: 50,
          totalItems: 0,
          totalPages: 0,
        },
      });
    });
  });

  describe('remove', () => {
    it('should remove an owned part', async () => {
      deleteChain.returning.mockResolvedValue([{ id: 1 }]);

      await expect(service.remove(userId, '3001', 1)).resolves.toBeUndefined();

      expect(deleteChain.delete).toHaveBeenCalled();
      expect(deleteChain.where).toHaveBeenCalled();
      expect(deleteChain.returning).toHaveBeenCalled();
    });

    it('should throw NotFoundException when owned part does not exist', async () => {
      deleteChain.returning.mockResolvedValue([]);

      await expect(service.remove(userId, '3001', 1)).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
