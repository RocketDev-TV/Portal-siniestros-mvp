import { EstatusSiniestro } from '@prisma/client';
import { IsEnum, IsOptional, IsString } from 'class-validator';

export class UpdateEstatusDto {
  @IsEnum(EstatusSiniestro, { message: 'Estatus inválido' })
  nuevoEstatus!: EstatusSiniestro;

  @IsOptional()
  @IsString()
  comentario?: string;
}
