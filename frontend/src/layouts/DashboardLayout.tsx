import { Outlet, useNavigate } from 'react-router-dom';
import type { AuthUser } from '../types';

const ROL_LABEL: Record<string, string> = {
  ADMIN: 'Administrador',
  AJUSTADOR: 'Ajustador',
  CLIENTE: 'Cliente',
};

const ROL_COLOR: Record<string, string> = {
  ADMIN: 'bg-purple-100 text-purple-700',
  AJUSTADOR: 'bg-blue-100 text-blue-700',
  CLIENTE: 'bg-green-100 text-green-700',
};

function getUser(): AuthUser | null {
  try { return JSON.parse(localStorage.getItem('user') ?? ''); } catch { return null; }
}

export default function DashboardLayout() {
  const navigate = useNavigate();
  const user = getUser();

  function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login', { replace: true });
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="bg-white border-b border-slate-200 px-6 py-3 flex items-center justify-between shadow-sm sticky top-0 z-10">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-sm select-none">
            PS
          </div>
          <span className="font-semibold text-slate-800 text-sm">Portal de Siniestros</span>
        </div>

        {user && (
          <div className="flex items-center gap-3">
            <span className="text-sm text-slate-600 hidden sm:block">{user.nombre}</span>
            <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${ROL_COLOR[user.rol]}`}>
              {ROL_LABEL[user.rol]}
            </span>
            <button
              onClick={logout}
              className="text-sm text-slate-500 hover:text-slate-800 border border-slate-200 rounded-lg px-3 py-1.5 hover:bg-slate-50 transition-colors"
            >
              Cerrar sesión
            </button>
          </div>
        )}
      </header>

      <main className="flex-1 p-6">
        <Outlet />
      </main>
    </div>
  );
}
