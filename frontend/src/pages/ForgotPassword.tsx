import { useState } from 'react';
import { Link } from 'react-router-dom';
import { authApi } from '../services/api';
import FloatingInput from '../components/FloatingInput';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [mensaje, setMensaje] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMensaje('');
    try {
      const { data } = await authApi.forgotPassword(email);
      setMensaje(data.message); // El mensaje
    } catch (err) {
      setMensaje('Si el correo existe en nuestro sistema, recibirás un enlace con instrucciones para recuperar tu contraseña.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen w-full flex">
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-indigo-950 via-indigo-900 to-slate-900">
        {/* Decoración de fondo */}
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-indigo-500/30 rounded-full blur-3xl animate-blob" />
        <div className="absolute bottom-0 right-0 w-[28rem] h-[28rem] bg-sky-500/20 rounded-full blur-3xl animate-blob" style={{ animationDelay: '3s' }} />
        <div className="relative z-10 flex flex-col justify-between p-12 text-white w-full">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-white/10 backdrop-blur border border-white/20 rounded-xl flex items-center justify-center font-bold text-lg">PS</div>
            <span className="font-semibold text-lg tracking-tight">Portal de Siniestros</span>
          </div>
          <div>
            <h2 className="text-3xl font-bold leading-tight mb-4 max-w-md">Recupera el acceso a tu cuenta.</h2>
            <p className="text-sm text-indigo-200/80 max-w-sm">Te enviaremos un enlace seguro que expira en 1 hora para proteger tu información.</p>
          </div>
          <p className="text-xs text-indigo-300/60">Inter Seguros © 2026</p>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-6 bg-slate-50">
        <div className="w-full max-w-sm">
          <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl shadow-slate-200/60 border border-white/60 p-8">
            <h1 className="text-2xl font-bold text-slate-900 mb-1">¿Olvidaste tu contraseña?</h1>
            <p className="text-sm text-slate-500 mb-8">Ingresa tu correo y te enviaremos instrucciones.</p>

            {mensaje ? (
              <div className="text-sm text-green-700 bg-green-50 border border-green-200 rounded-xl px-4 py-4 mb-6">
                {mensaje}
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <FloatingInput label="Correo electrónico" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
                <button type="submit" disabled={loading} className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl py-3 text-sm font-semibold transition-all shadow-lg shadow-indigo-600/20">
                  {loading ? 'Enviando...' : 'Enviar enlace'}
                </button>
              </form>
            )}

            <p className="text-sm text-center text-slate-500 mt-6">
              ¿Recordaste tu contraseña? <Link to="/login" className="text-indigo-600 font-semibold hover:text-indigo-800">Inicia sesión</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}