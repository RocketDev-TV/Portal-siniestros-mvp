import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { authApi } from '../services/api';
import { extractErrorMessage } from '../utils/errors';
import PasswordInput from '../components/PasswordInput';

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Validaciones
  const hasMinLength = password.length >= 6;
  const hasUpper = /[A-Z]/.test(password);
  const hasSymbol = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  const hasNumber = /\d/.test(password);
  const isPasswordValid = hasMinLength && hasUpper && hasSymbol && hasNumber;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    
    if (!token) {
      setError('El enlace no es válido. Vuelve a solicitar el cambio de contraseña.');
      return;
    }
    if (!isPasswordValid) {
      setError('La contraseña no cumple con los requisitos de seguridad.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden.');
      return;
    }

    setLoading(true);
    try {
      await authApi.resetPassword(token, password);
      setSuccess(true);
      setTimeout(() => navigate('/login'), 3000);
    } catch (err) {
      setError(extractErrorMessage(err, 'El enlace ha expirado o no es válido.'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-6 bg-slate-50">
      <div className="w-full max-w-sm">
        <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl shadow-slate-200/60 border border-white/60 p-8">
          <h1 className="text-2xl font-bold text-slate-900 mb-1">Nueva Contraseña</h1>
          <p className="text-sm text-slate-500 mb-6">Crea una nueva contraseña segura para tu cuenta.</p>

          {success ? (
            <div className="text-center">
              <div className="text-sm text-green-700 bg-green-50 border border-green-200 rounded-xl px-4 py-4 mb-4">
                ¡Contraseña actualizada con éxito! Redirigiendo al inicio de sesión...
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1">
                <PasswordInput label="Nueva Contraseña" required value={password} onChange={(e) => setPassword(e.target.value)} />
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
                      <span className="text-lg leading-none">{hasSymbol ? '✓' : '•'}</span> Al menos un símbolo
                    </div>
                    <div className={`flex items-center gap-2 text-xs transition-colors ${hasNumber ? 'text-green-600 font-medium' : 'text-slate-400'}`}>
                      <span className="text-lg leading-none">{hasNumber ? '✓' : '•'}</span> Al menos un número
                    </div>
                  </div>
                )}
              </div>

              <PasswordInput label="Confirmar Contraseña" required value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />

              {error && <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl px-3.5 py-2.5">{error}</div>}

              <button type="submit" disabled={loading} className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl py-3 text-sm font-semibold transition-all shadow-lg mt-2">
                {loading ? 'Guardando...' : 'Guardar nueva contraseña'}
              </button>
            </form>
          )}

          {!success && (
            <p className="text-sm text-center text-slate-500 mt-6">
              <Link to="/login" className="text-indigo-600 font-semibold hover:text-indigo-800">Volver al inicio de sesión</Link>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}