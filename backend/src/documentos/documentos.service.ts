import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { EstatusDocumento, Rol } from '@prisma/client';
import { unlink } from 'fs/promises';
import { basename, join } from 'path';
import { PrismaService } from '../prisma/prisma.service';
import { UPLOADS_DIR } from '../common/uploads.constant';
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

  async remove(id: string, user: ReqUser) {
    const documento = await this.prisma.documento.findUnique({
      where: { id },
      include: { siniestro: true },
    });
    if (!documento) throw new NotFoundException('Documento no encontrado');
    if (documento.siniestro.clienteId !== user.id) throw new ForbiddenException();
    if (documento.estatus !== EstatusDocumento.PENDIENTE) {
      throw new BadRequestException('Solo puedes eliminar documentos pendientes de revisión');
    }

    await this.prisma.documento.delete({ where: { id } });
    await unlink(join(UPLOADS_DIR, basename(documento.urlArchivo))).catch(() => {});

    return { message: 'Documento eliminado correctamente' };
  }
}
