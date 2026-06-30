import { Body, Controller, Get, Param, Patch, Post, Request, UseGuards } from '@nestjs/common';
import { Rol } from '@prisma/client';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { SiniestrosService } from './siniestros.service';
import { CreateSiniestroDto } from './dto/create-siniestro.dto';
import { UpdateEstatusDto } from './dto/update-estatus.dto';

@UseGuards(JwtAuthGuard)
@Controller('siniestros')
export class SiniestrosController {
  constructor(private readonly siniestrosService: SiniestrosService) {}

  @Get()
  findAll(@Request() req: any) {
    return this.siniestrosService.findAll(req.user);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Request() req: any) {
    return this.siniestrosService.findOne(id, req.user);
  }

  @Post()
  @UseGuards(RolesGuard)
  @Roles(Rol.ADMIN, Rol.AJUSTADOR)
  create(@Body() dto: CreateSiniestroDto, @Request() req: any) {
    return this.siniestrosService.create(dto, req.user.id);
  }

  @Patch(':id/estatus')
  @UseGuards(RolesGuard)
  @Roles(Rol.ADMIN, Rol.AJUSTADOR)
  updateEstatus(@Param('id') id: string, @Body() dto: UpdateEstatusDto, @Request() req: any) {
    return this.siniestrosService.updateEstatus(id, dto, req.user);
  }
}
