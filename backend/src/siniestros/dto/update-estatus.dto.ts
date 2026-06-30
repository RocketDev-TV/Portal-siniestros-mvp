import { EstatusSiniestro } from '@prisma/client';

export class UpdateEstatusDto {
  nuevoEstatus: EstatusSiniestro;
  comentario?: string;
}
