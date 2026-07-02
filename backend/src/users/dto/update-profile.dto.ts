import { IsEmail, IsOptional, IsString, MinLength } from 'class-validator';

export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  @MinLength(2, { message: 'El nombre debe tener al menos 2 caracteres' })
  nombre?: string;

  @IsOptional()
  @IsEmail({}, { message: 'Ingresa un correo electrónico válido' })
  email?: string;

  @IsOptional()
  @IsString()
  telefono?: string;
}
