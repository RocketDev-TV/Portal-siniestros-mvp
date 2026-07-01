import { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import type { AuthUser } from '../types';
import ProfileModal from '../components/ProfileModal';
import RolBadge from '../components/RolBadge';
import { ChevronDownIcon } from '../components/icons';

function getUser(): AuthUser | null {
  try { return JSON.parse(localStorage.getItem('user') ?? ''); } catch { return null; }
}

function initials(nombre: string) {
  return nombre
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join('');
}

export default function DashboardLayout() {
  const navigate = useNavigate();
  const [user, setUser] = useState(getUser());
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

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
          <div className="relative">
            <button
              onClick={() => setMenuOpen((o) => !o)}
              className="flex items-center gap-2.5 pl-1.5 pr-3 py-1.5 rounded-full hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-colors"
            >
              <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs font-bold shrink-0">
                {initials(user.nombre)}
              </div>
              <span className="text-sm text-slate-700 hidden sm:block font-medium">{user.nombre}</span>
              <span className="hidden md:inline-block">
                <RolBadge rol={user.rol} />
              </span>
              <ChevronDownIcon className={`w-3.5 h-3.5 text-slate-400 transition-transform ${menuOpen ? 'rotate-180' : ''}`} />
            </button>

            {menuOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-slate-100 py-1.5 z-20 animate-scale-in origin-top-right">
                  <div className="px-3.5 py-2.5 border-b border-slate-100">
                    <p className="text-sm font-semibold text-slate-800 truncate">{user.nombre}</p>
                    <p className="text-xs text-slate-400 truncate">{user.email}</p>
                  </div>
                  <button
                    onClick={() => { setMenuOpen(false); setProfileOpen(true); }}
                    className="w-full text-left px-3.5 py-2 text-sm text-slate-600 hover:bg-slate-50 transition-colors"
                  >
                    Mi perfil
                  </button>
                  <button
                    onClick={logout}
                    className="w-full text-left px-3.5 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                  >
                    Cerrar sesión
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </header>

      <main className="flex-1 p-6">
        <Outlet />
      </main>

      {profileOpen && user && (
        <ProfileModal user={user} onClose={() => setProfileOpen(false)} onUpdated={setUser} />
      )}
    </div>
  );
}
