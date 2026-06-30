import { PartialType } from '@nestjs/mapped-types';
import { CreateSiniestroDto } from './create-siniestro.dto';

export class UpdateSiniestroDto extends PartialType(CreateSiniestroDto) {}
