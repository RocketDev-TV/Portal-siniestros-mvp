import { EstatusDocumento } from '@prisma/client';
import { IsEnum, IsOptional, IsString } from 'class-validator';

export class UpdateDocumentoEstatusDto {
  @IsEnum(EstatusDocumento, { message: 'Estatus inválido' })
  estatus!: EstatusDocumento;

  @IsOptional()
  @IsString()
  comentario?: string;
}
