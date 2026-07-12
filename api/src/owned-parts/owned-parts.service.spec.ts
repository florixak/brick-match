import { Test, TestingModule } from '@nestjs/testing';
import { OwnedPartsService } from './owned-parts.service';

describe('OwnedPartsService', () => {
  let service: OwnedPartsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [OwnedPartsService],
    }).compile();

    service = module.get<OwnedPartsService>(OwnedPartsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
