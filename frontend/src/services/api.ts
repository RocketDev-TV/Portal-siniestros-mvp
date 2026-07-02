import axios from 'axios';
import type {
  AuthUser,
  ChangePasswordPayload,
  CreateSiniestroPayload,
  CreateUserPayload,
  Documento,
  EstatusDocumento,
  EstatusSiniestro,
  RegisterPayload,
  RegisterResponse,
  Siniestro,
  SiniestroDetalle,
  UpdateProfilePayload,
  UpdateUserPayload,
  UserAdmin,
  UserProfile,
  VerifyEmailPayload,
} from '../types';

export const API_BASE_URL = 'http://localhost:3000';

const api = axios.create({ baseURL: API_BASE_URL });

export function resolveFileUrl(urlArchivo: string) {
  return `${API_BASE_URL}${urlArchivo}`;
}

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  },
);

export const authApi = {
  login: (email: string, password: string) =>
    api.post<{ accessToken: string; user: AuthUser }>('/auth/login', { email, password }),
  register: (data: RegisterPayload) => api.post<RegisterResponse>('/auth/register', data),
  verifyEmail: (data: VerifyEmailPayload) =>
    api.post<{ accessToken: string; user: AuthUser }>('/auth/verify-email', data),
};

export const usersApi = {
  getMe: () => api.get<UserProfile>('/users/me'),
  updateProfile: (data: UpdateProfilePayload) => api.patch<UserProfile>('/users/me', data),
  changePassword: (data: ChangePasswordPayload) =>
    api.patch<{ message: string }>('/users/me/password', data),
};

export const adminUsersApi = {
  getAll: () => api.get<UserAdmin[]>('/users'),
  create: (data: CreateUserPayload) => api.post<UserAdmin>('/users', data),
  update: (id: string, data: UpdateUserPayload) => api.patch<UserAdmin>(`/users/${id}`, data),
  remove: (id: string) => api.delete<{ message: string }>(`/users/${id}`),
};

export const siniestrosApi = {
  getAll: () => api.get<Siniestro[]>('/siniestros'),
  getOne: (id: string) => api.get<SiniestroDetalle>(`/siniestros/${id}`),
  create: (data: CreateSiniestroPayload) => api.post<Siniestro>('/siniestros', data),
  updateEstatus: (id: string, nuevoEstatus: EstatusSiniestro, comentario?: string) =>
    api.patch<SiniestroDetalle>(`/siniestros/${id}/estatus`, { nuevoEstatus, comentario }),
};

export const documentosApi = {
  upload: (siniestroId: string, tipo: string, file: File) => {
    const formData = new FormData();
    formData.append('siniestroId', siniestroId);
    formData.append('tipo', tipo);
    formData.append('file', file);
    return api.post<Documento>('/documentos', formData);
  },
  updateEstatus: (id: string, estatus: EstatusDocumento, comentario?: string) =>
    api.patch<Documento>(`/documentos/${id}/estatus`, { estatus, comentario }),
  remove: (id: string) => api.delete<{ message: string }>(`/documentos/${id}`),
};

export default api;
