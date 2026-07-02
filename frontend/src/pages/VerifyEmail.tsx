import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { authApi } from '../services/api';
import { extractErrorMessage } from '../utils/errors';
import type { Rol } from '../types';
import FloatingInput from '../components/FloatingInput';

const DASHBOARD_PATH: Record<Rol, string> = {
  ADMIN: '/admin',
  AJUSTADOR: '/ajustador',
  CLIENTE: '/cliente',
};

export default function VerifyEmail() {
  const navigate = useNavigate();
  const location = useLocation();
  const stateEmail = (location.state as { email?: string } | null)?.email ?? '';

  const [email, setEmail] = useState(stateEmail);
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data } = await authApi.verifyEmail({ email, code });
      localStorage.setItem('token', data.accessToken);
      localStorage.setItem('user', JSON.stringify(data.user));
      navigate(DASHBOARD_PATH[data.user.rol], { replace: true });
    } catch (err) {
      setError(extractErrorMessage(err, 'Código de verificación incorrecto.'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen w-full flex">
      {/* Panel de marca */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-indigo-950 via-indigo-900 to-slate-900">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-indigo-500/30 rounded-full blur-3xl animate-blob" />
        <div
          className="absolute bottom-0 right-0 w-[28rem] h-[28rem] bg-sky-500/20 rounded-full blur-3xl animate-blob"
          style={{ animationDelay: '3s' }}
        />

        <div className="relative z-10 flex flex-col justify-between p-12 text-white w-full">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-white/10 backdrop-blur border border-white/20 rounded-xl flex items-center justify-center font-bold text-lg">
              PS
            </div>
            <span className="font-semibold text-lg tracking-tight">Portal de Siniestros</span>
          </div>

          <div>
            <h2 className="text-3xl font-bold leading-tight mb-4 max-w-md">
              Ya casi. Confirma tu correo para activar tu cuenta.
            </h2>
            <p className="text-sm text-indigo-200/80 max-w-sm">
              Te enviamos un código de 6 dígitos para verificar que esta cuenta te pertenece.
            </p>
          </div>

          <p className="text-xs text-indigo-300/60">Inter Seguros © 2026 · Todos los derechos reservados</p>
        </div>
      </div>

      {/* Panel de formulario */}
      <div className="flex-1 flex items-center justify-center p-6 bg-slate-50">
        <div className="w-full max-w-sm">
          <div className="lg:hidden flex justify-center mb-6">
            <div className="w-14 h-14 bg-indigo-600 rounded-2xl flex items-center justify-center text-white font-bold text-xl shadow-md">
              PS
            </div>
          </div>

          <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl shadow-slate-200/60 border border-white/60 p-8">
            <h1 className="text-2xl font-bold text-slate-900 mb-1">Verifica tu cuenta</h1>
            <p className="text-sm text-slate-500 mb-8">
              Ingresa el código de 6 dígitos que enviamos a tu correo.
            </p>

            <form onSubmit={handleSubmit} className="space-y-5">
              <FloatingInput
                label="Correo electrónico"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />

              <FloatingInput
                label="Código de verificación"
                required
                inputMode="numeric"
                maxLength={6}
                autoComplete="one-time-code"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                className="tracking-[0.5em] font-mono text-center"
              />

              {error && (
                <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl px-3.5 py-2.5 animate-shake">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading || code.length !== 6}
                className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl py-3 text-sm font-semibold transition-all shadow-lg shadow-indigo-600/20 hover:shadow-indigo-600/30 active:scale-[0.99]"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    Verificando...
                  </span>
                ) : (
                  'Verificar cuenta'
                )}
              </button>
            </form>

            <p className="text-xs text-center text-slate-400 mt-6">
              Por ahora el código se muestra en la consola del servidor (el envío por correo llega en la Fase 3).
            </p>

            <p className="text-sm text-center text-slate-500 mt-4">
              ¿Ya verificaste tu cuenta?{' '}
              <Link to="/login" className="text-indigo-600 font-semibold hover:text-indigo-800">
                Inicia sesión
              </Link>
            </p>
          </div>

          <p className="text-xs text-center text-slate-400 mt-6">Inter Seguros · Portal de Siniestros 2026</p>
        </div>
      </div>
    </div>
  );
}
