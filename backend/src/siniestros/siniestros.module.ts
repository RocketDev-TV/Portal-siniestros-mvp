import { Module } from '@nestjs/common';
import { SiniestrosService } from './siniestros.service';
import { SiniestrosController } from './siniestros.controller';

@Module({
  controllers: [SiniestrosController],
  providers: [SiniestrosService],
})
export class SiniestrosModule {}
