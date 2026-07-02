import { BadRequestException, ConflictException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ChangePasswordDto } from './dto/change-password.dto';

const PROFILE_SELECT = {
  id: true,
  email: true,
  nombre: true,
  telefono: true,
  rol: true,
  isVerified: true,
  fechaCreacion: true,
} as const;

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  // --- Perfil del usuario autenticado ---
  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: PROFILE_SELECT,
    });
    if (!user) throw new NotFoundException('Usuario no encontrado');
    return user;
  }

  async updateProfile(userId: string, dto: UpdateProfileDto) {
    if (dto.email) {
      const existing = await this.prisma.user.findUnique({ where: { email: dto.email } });
      if (existing && existing.id !== userId) {
        throw new ConflictException('Ese correo ya está en uso por otra cuenta');
      }
    }

    return this.prisma.user.update({
      where: { id: userId },
      data: { nombre: dto.nombre, email: dto.email, telefono: dto.telefono },
      select: PROFILE_SELECT,
    });
  }

  async changePassword(userId: string, dto: ChangePasswordDto) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('Usuario no encontrado');

    const isValid = await bcrypt.compare(dto.currentPassword, user.password);
    if (!isValid) throw new UnauthorizedException('La contraseña actual es incorrecta');

    const hashed = await bcrypt.hash(dto.newPassword, 10);
    await this.prisma.user.update({
      where: { id: userId },
      data: { password: hashed },
    });

    return { message: 'Contraseña actualizada correctamente' };
  }

  // --- Control de usuarios (solo Admin) ---
  async findAllUsers() {
    return this.prisma.user.findMany({
      select: {
        ...PROFILE_SELECT,
        _count: { select: { siniestrosCliente: true, siniestrosAsignados: true } },
      },
      orderBy: { fechaCreacion: 'desc' },
    });
  }

  async createUser(dto: CreateUserDto) {
    const existing = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (existing) throw new ConflictException('Ese correo ya está registrado');

    const hashed = await bcrypt.hash(dto.password, 10);
    return this.prisma.user.create({
      data: { nombre: dto.nombre, email: dto.email, password: hashed, rol: dto.rol, isVerified: true },
      select: PROFILE_SELECT,
    });
  }

  async updateUser(id: string, dto: UpdateUserDto) {
    if (dto.email) {
      const existing = await this.prisma.user.findUnique({ where: { email: dto.email } });
      if (existing && existing.id !== id) {
        throw new ConflictException('Ese correo ya está en uso por otra cuenta');
      }
    }

    const data: Prisma.UserUpdateInput = { nombre: dto.nombre, email: dto.email, rol: dto.rol };
    if (dto.password) {
      data.password = await bcrypt.hash(dto.password, 10);
    }

    try {
      return await this.prisma.user.update({
        where: { id },
        data,
        select: PROFILE_SELECT,
      });
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2025') {
        throw new NotFoundException('Usuario no encontrado');
      }
      throw e;
    }
  }

  async removeUser(id: string, requesterId: string) {
    if (id === requesterId) {
      throw new BadRequestException('No puedes eliminar tu propio usuario');
    }

    try {
      await this.prisma.user.delete({ where: { id } });
      return { message: 'Usuario eliminado correctamente' };
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError) {
        if (e.code === 'P2025') throw new NotFoundException('Usuario no encontrado');
        if (e.code === 'P2003') {
          throw new BadRequestException('No se puede eliminar: el usuario tiene siniestros o historial asociado.');
        }
      }
      throw e;
    }
  }
}
