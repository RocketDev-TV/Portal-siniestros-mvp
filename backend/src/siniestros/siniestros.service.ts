import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, Rol } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSiniestroDto } from './dto/create-siniestro.dto';
import { UpdateEstatusDto } from './dto/update-estatus.dto';

type ReqUser = { id: string; rol: Rol };

@Injectable()
export class SiniestrosService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(user: ReqUser) {
    const where =
      user.rol === Rol.CLIENTE
        ? { clienteId: user.id }
        : user.rol === Rol.AJUSTADOR
          ? { ajustadorId: user.id }
          : {};

    return this.prisma.siniestro.findMany({
      where,
      include: {
        cliente: { select: { id: true, nombre: true, email: true } },
        ajustador: { select: { id: true, nombre: true, email: true } },
        _count: { select: { documentos: true, historial: true } },
      },
      orderBy: { fechaReporte: 'desc' },
    });
  }

  async findOne(id: string, user: ReqUser) {
    const siniestro = await this.prisma.siniestro.findUnique({
      where: { id },
      include: {
        cliente: { select: { id: true, nombre: true, email: true } },
        ajustador: { select: { id: true, nombre: true, email: true } },
        documentos: true,
        historial: {
          include: { cambiadoPor: { select: { nombre: true, rol: true } } },
          orderBy: { fechaCambio: 'asc' },
        },
      },
    });

    if (!siniestro) throw new NotFoundException('Siniestro no encontrado');

    if (user.rol === Rol.CLIENTE && siniestro.clienteId !== user.id) throw new ForbiddenException();
    if (user.rol === Rol.AJUSTADOR && siniestro.ajustadorId !== user.id) throw new ForbiddenException();

    return siniestro;
  }

  async create(dto: CreateSiniestroDto, userId: string) {
    const count = await this.prisma.siniestro.count();
    const folio = `SIN-${new Date().getFullYear()}-${String(count + 1).padStart(4, '0')}`;

    try {
      return await this.prisma.siniestro.create({
        data: {
          folio,
          descripcion: dto.descripcion,
          clienteId: dto.clienteId,
          ajustadorId: dto.ajustadorId ?? null,
          fechaFalla: dto.fechaFalla ? new Date(dto.fechaFalla) : null,
          historial: {
            create: {
              estatusNuevo: 'REPORTADO',
              comentario: 'Siniestro registrado en el sistema',
              cambiadoPorId: userId,
            },
          },
        },
        include: {
          cliente: { select: { id: true, nombre: true, email: true } },
          ajustador: { select: { id: true, nombre: true, email: true } },
        },
      });
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2003') {
        const field = (e.meta?.field_name as string) ?? '';
        const entidad = field.includes('ajustador') ? 'ajustador' : 'cliente';
        throw new BadRequestException(`El ${entidad} especificado no existe`);
      }
      throw e;
    }
  }

  async updateEstatus(id: string, dto: UpdateEstatusDto, user: ReqUser) {
    const siniestro = await this.prisma.siniestro.findUnique({ where: { id } });
    if (!siniestro) throw new NotFoundException('Siniestro no encontrado');

    if (user.rol === Rol.AJUSTADOR && siniestro.ajustadorId !== user.id) throw new ForbiddenException();

    return this.prisma.siniestro.update({
      where: { id },
      data: {
        estatus: dto.nuevoEstatus,
        historial: {
          create: {
            estatusAnterior: siniestro.estatus,
            estatusNuevo: dto.nuevoEstatus,
            comentario: dto.comentario ?? null,
            cambiadoPorId: user.id,
          },
        },
      },
      include: {
        historial: {
          include: { cambiadoPor: { select: { nombre: true, rol: true } } },
          orderBy: { fechaCambio: 'asc' },
        },
      },
    });
  }
}
