import { Test, TestingModule } from '@nestjs/testing';
import { SiniestrosController } from './siniestros.controller';
import { SiniestrosService } from './siniestros.service';

describe('SiniestrosController', () => {
  let controller: SiniestrosController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SiniestrosController],
      providers: [SiniestrosService],
    }).compile();

    controller = module.get<SiniestrosController>(SiniestrosController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
