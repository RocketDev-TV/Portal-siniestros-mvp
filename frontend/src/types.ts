export type Rol = 'ADMIN' | 'AJUSTADOR' | 'CLIENTE';

export type EstatusSiniestro =
  | 'REPORTADO'
  | 'EN_REVISION'
  | 'DOCUMENTOS_PENDIENTES'
  | 'APROBADO'
  | 'RECHAZADO'
  | 'FINALIZADO';

export interface AuthUser {
  id: string;
  email: string;
  nombre: string;
  rol: Rol;
}

export interface UserBasic {
  id: string;
  nombre: string;
  email: string;
}

export interface Siniestro {
  id: string;
  folio: string;
  descripcion: string;
  estatus: EstatusSiniestro;
  fechaReporte: string;
  fechaFalla: string | null;
  cliente: UserBasic;
  ajustador: UserBasic | null;
  _count: { documentos: number; historial: number };
}

export interface HistorialItem {
  id: string;
  estatusAnterior: EstatusSiniestro | null;
  estatusNuevo: EstatusSiniestro;
  comentario: string | null;
  fechaCambio: string;
  cambiadoPor: { nombre: string; rol: Rol };
}

export interface SiniestroDetalle extends Omit<Siniestro, '_count'> {
  documentos: Array<{
    id: string;
    tipo: string;
    urlArchivo: string;
    fechaSubida: string;
  }>;
  historial: HistorialItem[];
}
