import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Rol } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { VerifyEmailDto } from './dto/verify-email.dto';
import { MailService } from '../mail/mail.service';
import * as crypto from 'crypto';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly mailService: MailService,
  ) {}

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({ where: { email: dto.email } });

    if (!user || !(await bcrypt.compare(dto.password, user.password))) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    if (!user.isVerified) {
      throw new ForbiddenException('Debes verificar tu correo antes de iniciar sesión');
    }

    return this.buildAuthResponse(user);
  }

  async register(dto: RegisterDto) {
    const existing = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (existing) throw new ConflictException('Ese correo ya está registrado');

    const hashed = await bcrypt.hash(dto.password, 10);
    const verificationCode = this.generateVerificationCode();

    const user = await this.prisma.user.create({
      data: {
        nombre: dto.nombre,
        email: dto.email,
        password: hashed,
        telefono: dto.telefono,
        rol: Rol.CLIENTE,
        verificationCode,
      },
    });

    // Enviar código por correo real
    await this.mailService.sendOtpEmail(user.email, user.nombre, verificationCode);
    console.log(`[OTP] Código de verificación para ${user.email}: ${verificationCode}`); // Lo dejamos por si falla tu SMTP

    return { message: 'Cuenta creada. Revisa tu correo para verificar tu cuenta.', email: user.email };
  }

  async verifyEmail(dto: VerifyEmailDto) {
    const user = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (!user) throw new NotFoundException('Usuario no encontrado');
    if (user.isVerified) throw new ConflictException('Esta cuenta ya fue verificada');
    if (!user.verificationCode || user.verificationCode !== dto.code) {
      throw new UnauthorizedException('Código de verificación incorrecto');
    }

    const verified = await this.prisma.user.update({
      where: { id: user.id },
      data: { isVerified: true, verificationCode: null },
    });

    return this.buildAuthResponse(verified);
  }

  private generateVerificationCode(): string {
    return String(Math.floor(100000 + Math.random() * 900000));
  }

  private buildAuthResponse(user: { id: string; email: string; nombre: string; rol: Rol }) {
    const payload = { sub: user.id, email: user.email, rol: user.rol };

    return {
      accessToken: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        nombre: user.nombre,
        rol: user.rol,
      },
    };
  }

  async forgotPassword(email: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    
    if (user) {
      const resetToken = crypto.randomBytes(32).toString('hex');
      const resetExpires = new Date(Date.now() + 3600000); 

      await this.prisma.user.update({
        where: { id: user.id },
        data: { resetToken, resetExpires },
      });

      await this.mailService.sendPasswordResetEmail(user.email, user.nombre, resetToken);
    }

    return { message: 'Si el correo existe en nuestro sistema, recibirás un enlace con instrucciones para recuperar tu contraseña.' };
  }

  async resetPassword(token: string, newPassword: string) {
    const user = await this.prisma.user.findFirst({
      where: {
        resetToken: token,
        resetExpires: { gt: new Date() },
      },
    });

    if (!user) {
      throw new UnauthorizedException('El enlace es inválido o ha expirado.');
    }

    const hashed = await bcrypt.hash(newPassword, 10);
    await this.prisma.user.update({
      where: { id: user.id },
      data: { password: hashed, resetToken: null, resetExpires: null },
    });

    return { message: 'Contraseña actualizada correctamente.' };
  }
}
