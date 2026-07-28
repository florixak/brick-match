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
import { eq, type SQL } from 'drizzle-orm';
import { PgDialect } from 'drizzle-orm/pg-core';
import { DatabaseService } from 'src/database/database.service';
import { userOwnedParts } from 'src/database/schema';
import { OwnedPartsService } from './owned-parts.service';

const pgDialect = new PgDialect();
const otherUserId = '22222222-2222-2222-2222-222222222222';

function expectDeleteWhereScopedToUser(
  whereMock: jest.Mock,
  targetUserId: string,
) {
  expect(whereMock).toHaveBeenCalledTimes(1);
  const [whereClause] = whereMock.mock.calls[0] as [SQL];
  const expected = eq(userOwnedParts.userId, targetUserId);

  expect(pgDialect.sqlToQuery(whereClause)).toEqual(
    pgDialect.sqlToQuery(expected),
  );
  expect(pgDialect.sqlToQuery(whereClause).params).not.toContain(otherUserId);
}

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
  const innerJoinPartCategories = jest.fn().mockReturnValue({ where });
  const innerJoinColors = jest
    .fn()
    .mockReturnValue({ innerJoin: innerJoinPartCategories });
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
    innerJoinPartCategories,
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

function createUpdateChain<T>(result: T[]) {
  const returning = jest.fn().mockResolvedValue(result);
  const where = jest.fn().mockReturnValue({ returning });
  const set = jest.fn().mockReturnValue({ where });
  const update = jest.fn().mockReturnValue({ set });

  return { update, set, where, returning };
}

describe('OwnedPartsService', () => {
  let service: OwnedPartsService;
  let insertChain: ReturnType<typeof createInsertChain>;
  let countChain: ReturnType<typeof createCountSelectChain>;
  let listChain: ReturnType<typeof createFindAllSelectChain>;
  let deleteChain: ReturnType<typeof createDeleteChain>;
  let updateChain: ReturnType<typeof createUpdateChain>;
  let select: jest.Mock;
  let execute: jest.Mock;

  const userId = '11111111-1111-1111-1111-111111111111';

  beforeEach(async () => {
    insertChain = createInsertChain([]);
    countChain = createCountSelectChain([{ count: 0 }]);
    listChain = createFindAllSelectChain([]);
    deleteChain = createDeleteChain([]);
    updateChain = createUpdateChain([]);
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
              update: updateChain.update,
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
        partCategoryId: 11,
        partCategoryName: 'Bricks',
      },
      {
        partNum: '3003',
        colorId: 15,
        quantity: 2,
        partName: 'Brick 2 x 2',
        colorName: 'Trans-Light Blue',
        colorRgb: 'AEEFEC',
        partCategoryId: 11,
        partCategoryName: 'Bricks',
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

  describe('update', () => {
    const updateRequest = {
      from: { partNum: '3001', colorId: 0 },
      to: { partNum: '3001', colorId: 0, quantity: 1 },
    };

    it('should update quantity for the same owned part identity', async () => {
      updateChain.returning.mockResolvedValue([
        { partNum: '3001', colorId: 0, quantity: 1 },
      ]);

      await expect(service.update(userId, updateRequest)).resolves.toEqual({
        part: { partNum: '3001', colorId: 0, quantity: 1 },
        merged: false,
      });

      expect(updateChain.update).toHaveBeenCalled();
      expect(updateChain.set).toHaveBeenCalledWith({ quantity: 1 });
      expect(updateChain.returning).toHaveBeenCalled();
      expect(execute).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException when same-identity source is missing', async () => {
      updateChain.returning.mockResolvedValue([]);

      await expect(service.update(userId, updateRequest)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should change color without merging when target row does not exist', async () => {
      execute.mockResolvedValue({
        rows: [
          {
            part_num: '3001',
            color_id: 14,
            quantity: 2,
            merged: false,
          },
        ],
      });

      await expect(
        service.update(userId, {
          from: { partNum: '3001', colorId: 0 },
          to: { partNum: '3001', colorId: 14, quantity: 2 },
        }),
      ).resolves.toEqual({
        part: { partNum: '3001', colorId: 14, quantity: 2 },
        merged: false,
      });

      expect(execute).toHaveBeenCalled();
      expect(updateChain.update).not.toHaveBeenCalled();
    });

    it('should merge quantities when color change targets an existing row', async () => {
      execute.mockResolvedValue({
        rows: [
          {
            part_num: '3001',
            color_id: 14,
            quantity: 5,
            merged: true,
          },
        ],
      });

      await expect(
        service.update(userId, {
          from: { partNum: '3001', colorId: 0 },
          to: { partNum: '3001', colorId: 14, quantity: 1 },
        }),
      ).resolves.toEqual({
        part: { partNum: '3001', colorId: 14, quantity: 5 },
        merged: true,
      });

      expect(execute).toHaveBeenCalled();
    });

    it('should throw NotFoundException when color-change source is missing', async () => {
      execute.mockResolvedValue({ rows: [] });

      await expect(
        service.update(userId, {
          from: { partNum: '3001', colorId: 0 },
          to: { partNum: '3001', colorId: 14, quantity: 1 },
        }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException when target color is not in catalog', async () => {
      execute.mockRejectedValue({ code: '23503' });

      await expect(
        service.update(userId, {
          from: { partNum: '3001', colorId: 0 },
          to: { partNum: '3001', colorId: 999, quantity: 1 },
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('removeAll', () => {
    it('should delete only the requesting user owned parts', async () => {
      deleteChain.where.mockResolvedValue(undefined);

      await expect(service.removeAll(userId)).resolves.toBeUndefined();

      expect(deleteChain.delete).toHaveBeenCalled();
      expectDeleteWhereScopedToUser(deleteChain.where, userId);
      expect(deleteChain.returning).not.toHaveBeenCalled();
    });

    it('should succeed when the user has no owned parts', async () => {
      deleteChain.where.mockResolvedValue(undefined);

      await expect(service.removeAll(userId)).resolves.toBeUndefined();

      expect(deleteChain.delete).toHaveBeenCalled();
      expectDeleteWhereScopedToUser(deleteChain.where, userId);
    });
  });
});
