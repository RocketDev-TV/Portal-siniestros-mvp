import { IsNotEmpty, IsString } from 'class-validator';

export class CreateDocumentoDto {
  @IsString()
  @IsNotEmpty({ message: 'El siniestro es obligatorio' })
  siniestroId!: string;

  @IsString()
  @IsNotEmpty({ message: 'El tipo de documento es obligatorio' })
  tipo!: string;
}
