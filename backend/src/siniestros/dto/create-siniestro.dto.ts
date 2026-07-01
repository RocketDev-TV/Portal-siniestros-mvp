import { IsDateString, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateSiniestroDto {
  @IsString()
  @IsNotEmpty({ message: 'La descripción es obligatoria' })
  descripcion!: string;

  @IsOptional()
  @IsString()
  clienteId?: string;

  @IsOptional()
  @IsString()
  ajustadorId?: string;

  @IsOptional()
  @IsDateString()
  fechaFalla?: string;
}
