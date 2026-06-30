import axios from 'axios';
import type { AuthUser, EstatusSiniestro, Siniestro, SiniestroDetalle } from '../types';

const api = axios.create({ baseURL: 'http://localhost:3000' });

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
};

export const siniestrosApi = {
  getAll: () => api.get<Siniestro[]>('/siniestros'),
  getOne: (id: string) => api.get<SiniestroDetalle>(`/siniestros/${id}`),
  updateEstatus: (id: string, nuevoEstatus: EstatusSiniestro, comentario?: string) =>
    api.patch<SiniestroDetalle>(`/siniestros/${id}/estatus`, { nuevoEstatus, comentario }),
};

export default api;
