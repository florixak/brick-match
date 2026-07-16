import { Test, TestingModule } from '@nestjs/testing';
import { MatchingController } from './matching.controller';
import { MatchingService } from './matching.service';
import { GetMatchesApiResponseSchema } from '@lego-matcher/shared-types';

describe('MatchingController', () => {
  let controller: MatchingController;

  const matchingService = {
    findMatches: jest.fn(),
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
});
