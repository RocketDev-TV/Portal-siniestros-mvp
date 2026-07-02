import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authApi } from '../services/api';
import { extractErrorMessage } from '../utils/errors';
import FloatingInput from '../components/FloatingInput';
import PasswordInput from '../components/PasswordInput';

const HIGHLIGHTS = [
  { title: 'Reporta en minutos', desc: 'Abre un caso nuevo y te asignamos un ajustador al instante.' },
  { title: 'Sigue tu caso 24/7', desc: 'Consulta el historial y el estatus desde cualquier dispositivo.' },
  { title: 'Tus documentos, seguros', desc: 'Sube evidencias y dales seguimiento hasta su aprobación.' },
];

export default function Register() {
  const navigate = useNavigate();
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [telefono, setTelefono] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  // --- Validaciones de contraseña en tiempo real ---
  const hasMinLength = password.length >= 6;
  const hasUpper = /[A-Z]/.test(password);
  const hasSymbol = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  const hasNumber = /\d/.test(password); // <-- NUEVA REGLA
  const isPasswordValid = hasMinLength && hasUpper && hasSymbol && hasNumber;

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden.');
      return;
    }

    if (!isPasswordValid) {
      setError('La contraseña no cumple con los requisitos de seguridad.');
      return;
    }
    
    setLoading(true);
    try {
      await authApi.register({ nombre, email, password, telefono: telefono || undefined });
      navigate('/verify-email', { state: { email } });
    } catch (err) {
      setError(extractErrorMessage(err, 'No se pudo crear tu cuenta. Intenta de nuevo.'));
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
              Crea tu cuenta y da seguimiento a tu siniestro paso a paso.
            </h2>
            <div className="space-y-4 mt-10">
              {HIGHLIGHTS.map((h) => (
                <div key={h.title} className="flex gap-3">
                  <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-sky-400 shrink-0" />
                  <div>
                    <p className="font-semibold text-sm text-white">{h.title}</p>
                    <p className="text-sm text-indigo-200/80">{h.desc}</p>
                  </div>
                </div>
              ))}
            </div>
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
            <h1 className="text-2xl font-bold text-slate-900 mb-1">Crea tu cuenta</h1>
            <p className="text-sm text-slate-500 mb-8">Regístrate para reportar y dar seguimiento a tus siniestros</p>

            <form onSubmit={handleSubmit} className="space-y-5">
              <FloatingInput
                label="Nombre completo"
                required
                autoComplete="name"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
              />

              <FloatingInput
                label="Correo electrónico"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />

              <FloatingInput
                label="Teléfono (opcional)"
                type="tel"
                autoComplete="tel"
                value={telefono}
                onChange={(e) => setTelefono(e.target.value)}
              />

              <div className="space-y-1">
                <PasswordInput
                  label="Contraseña"
                  required
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                
                {/* --- Checklist visual de contraseña --- */}
                {password.length > 0 && (
                  <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 mt-2 space-y-1.5 animate-fade-in">
                    <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide mb-1">Tu contraseña debe tener:</p>
                    <div className={`flex items-center gap-2 text-xs transition-colors ${hasMinLength ? 'text-green-600 font-medium' : 'text-slate-400'}`}>
                      <span className="text-lg leading-none">{hasMinLength ? '✓' : '•'}</span> Al menos 6 caracteres
                    </div>
                    <div className={`flex items-center gap-2 text-xs transition-colors ${hasUpper ? 'text-green-600 font-medium' : 'text-slate-400'}`}>
                      <span className="text-lg leading-none">{hasUpper ? '✓' : '•'}</span> Al menos una letra mayúscula
                    </div>
                    <div className={`flex items-center gap-2 text-xs transition-colors ${hasSymbol ? 'text-green-600 font-medium' : 'text-slate-400'}`}>
                      <span className="text-lg leading-none">{hasSymbol ? '✓' : '•'}</span> Al menos un símbolo (ej. !@#$%)
                    </div>
                    <div className={`flex items-center gap-2 text-xs transition-colors ${hasNumber ? 'text-green-600 font-medium' : 'text-slate-400'}`}>
                      <span className="text-lg leading-none">{hasNumber ? '✓' : '•'}</span> Al menos un número
                    </div>
                  </div>
                )}
              </div>

              <PasswordInput
                label="Confirmar contraseña"
                required
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />

              {error && (
                <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl px-3.5 py-2.5 animate-shake">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl py-3 text-sm font-semibold transition-all shadow-lg shadow-indigo-600/20 hover:shadow-indigo-600/30 active:scale-[0.99]"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    Creando cuenta...
                  </span>
                ) : (
                  'Crear cuenta'
                )}
              </button>
            </form>

            <p className="text-sm text-center text-slate-500 mt-6">
              ¿Ya tienes cuenta?{' '}
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
