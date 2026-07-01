export type Rol = 'ADMIN' | 'AJUSTADOR' | 'CLIENTE';

export type EstatusSiniestro =
  | 'REPORTADO'
  | 'EN_REVISION'
  | 'DOCUMENTOS_PENDIENTES'
  | 'APROBADO'
  | 'RECHAZADO'
  | 'FINALIZADO';

export type EstatusDocumento = 'PENDIENTE' | 'APROBADO' | 'RECHAZADO';

export interface AuthUser {
  id: string;
  email: string;
  nombre: string;
  rol: Rol;
}

export interface UserProfile extends AuthUser {
  fechaCreacion: string;
}

export interface UpdateProfilePayload {
  nombre?: string;
  email?: string;
}

export interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
}

export interface UserAdmin extends UserProfile {
  _count: { siniestrosCliente: number; siniestrosAsignados: number };
}

export interface CreateUserPayload {
  nombre: string;
  email: string;
  password: string;
  rol: Rol;
}

export interface UpdateUserPayload {
  nombre?: string;
  email?: string;
  rol?: Rol;
  password?: string;
}

export interface RegisterPayload {
  nombre: string;
  email: string;
  password: string;
}

export interface CreateSiniestroPayload {
  descripcion: string;
  fechaFalla?: string;
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

export interface Documento {
  id: string;
  tipo: string;
  urlArchivo: string;
  estatus: EstatusDocumento;
  comentario: string | null;
  fechaSubida: string;
  siniestroId: string;
}

export interface SiniestroDetalle extends Omit<Siniestro, '_count'> {
  documentos: Documento[];
  historial: HistorialItem[];
}
