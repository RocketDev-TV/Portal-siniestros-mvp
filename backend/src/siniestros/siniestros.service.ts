import { Injectable } from '@nestjs/common';
import { CreateSiniestroDto } from './dto/create-siniestro.dto';
import { UpdateSiniestroDto } from './dto/update-siniestro.dto';

@Injectable()
export class SiniestrosService {
  create(createSiniestroDto: CreateSiniestroDto) {
    return 'This action adds a new siniestro';
  }

  findAll() {
    return `This action returns all siniestros`;
  }

  findOne(id: number) {
    return `This action returns a #${id} siniestro`;
  }

  update(id: number, updateSiniestroDto: UpdateSiniestroDto) {
    return `This action updates a #${id} siniestro`;
  }

  remove(id: number) {
    return `This action removes a #${id} siniestro`;
  }
}
