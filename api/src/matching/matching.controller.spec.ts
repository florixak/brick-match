import { Test, TestingModule } from '@nestjs/testing';
import { MatchingController } from './matching.controller';
import { MatchingService } from './matching.service';
import { type Response } from 'express';

describe('MatchingController', () => {
  let controller: MatchingController;

  const matchingService = {
    findMatches: jest.fn(),
    buildMissingPartsCsv: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MatchingController],
      providers: [
        {
          provide: MatchingService,
          useValue: matchingService,
        },
      ],
    }).compile();

    controller = module.get<MatchingController>(MatchingController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should call findMatches with the correct parameters', async () => {
    const userId = '123';
    const query = {
      limit: 10,
    };
    const response = {
      data: {
        results: [],
      },
      meta: {
        total: 0,
        page: 1,
        limit: 10,
      },
    };
    matchingService.findMatches.mockResolvedValue(response);
    const result = await controller.findMatches(userId, query);
    expect(result).toEqual(response);
    expect(matchingService.findMatches).toHaveBeenCalledWith(userId, query);
  });

  it('sets CSV headers and sends service output', async () => {
    matchingService.buildMissingPartsCsv.mockResolvedValue(
      'Part,Color,Quantity\n3003,1,2',
    );
    const res = { set: jest.fn(), send: jest.fn() };
    await controller.exportMissingParts(
      'user-1',
      '60001-1',
      res as unknown as Response,
    );
    expect(matchingService.buildMissingPartsCsv).toHaveBeenCalledWith(
      'user-1',
      '60001-1',
    );
    expect(res.set).toHaveBeenCalledWith({
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': 'attachment; filename="60001-1-missing-parts.csv"',
    });
    expect(res.send).toHaveBeenCalledWith('Part,Color,Quantity\n3003,1,2');
  });
});
