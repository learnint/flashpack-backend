import { Test, TestingModule } from '@nestjs/testing';
import { PackService } from './pack.service';

describe('PackService', () => {
  let service: PackService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PackService],
    }).compile();

    service = module.get<PackService>(PackService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
