import type { Rol } from '../types';

export const ROL_LABEL: Record<Rol, string> = {
  ADMIN: 'Administrador',
  AJUSTADOR: 'Ajustador',
  CLIENTE: 'Cliente',
};

const ROL_COLOR: Record<Rol, string> = {
  ADMIN: 'bg-purple-100 text-purple-700',
  AJUSTADOR: 'bg-blue-100 text-blue-700',
  CLIENTE: 'bg-green-100 text-green-700',
};

export default function RolBadge({ rol }: { rol: Rol }) {
  return <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${ROL_COLOR[rol]}`}>{ROL_LABEL[rol]}</span>;
}
