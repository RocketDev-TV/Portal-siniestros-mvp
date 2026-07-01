import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { Rol } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDocumentoDto } from './dto/create-documento.dto';
import { UpdateDocumentoEstatusDto } from './dto/update-documento-estatus.dto';

type ReqUser = { id: string; rol: Rol };

@Injectable()
export class DocumentosService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateDocumentoDto, urlArchivo: string, user: ReqUser) {
    const siniestro = await this.prisma.siniestro.findUnique({ where: { id: dto.siniestroId } });
    if (!siniestro) throw new NotFoundException('Siniestro no encontrado');

    if (user.rol === Rol.CLIENTE && siniestro.clienteId !== user.id) throw new ForbiddenException();
    if (user.rol === Rol.AJUSTADOR && siniestro.ajustadorId !== user.id) throw new ForbiddenException();

    return this.prisma.documento.create({
      data: { siniestroId: dto.siniestroId, tipo: dto.tipo, urlArchivo },
    });
  }

  async updateEstatus(id: string, dto: UpdateDocumentoEstatusDto, user: ReqUser) {
    const documento = await this.prisma.documento.findUnique({
      where: { id },
      include: { siniestro: true },
    });
    if (!documento) throw new NotFoundException('Documento no encontrado');

    if (user.rol === Rol.AJUSTADOR && documento.siniestro.ajustadorId !== user.id) throw new ForbiddenException();

    return this.prisma.documento.update({
      where: { id },
      data: { estatus: dto.estatus, comentario: dto.comentario ?? null },
    });
  }
}
