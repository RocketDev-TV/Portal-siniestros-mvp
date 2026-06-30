import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { SiniestrosService } from './siniestros.service';
import { CreateSiniestroDto } from './dto/create-siniestro.dto';
import { UpdateSiniestroDto } from './dto/update-siniestro.dto';

@Controller('siniestros')
export class SiniestrosController {
  constructor(private readonly siniestrosService: SiniestrosService) {}

  @Post()
  create(@Body() createSiniestroDto: CreateSiniestroDto) {
    return this.siniestrosService.create(createSiniestroDto);
  }

  @Get()
  findAll() {
    return this.siniestrosService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.siniestrosService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateSiniestroDto: UpdateSiniestroDto) {
    return this.siniestrosService.update(+id, updateSiniestroDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.siniestrosService.remove(+id);
  }
}
