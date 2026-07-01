import { useState } from 'react';
import { adminUsersApi } from '../services/api';
import type { CreateUserPayload, Rol, UpdateUserPayload, UserAdmin } from '../types';
import FloatingInput from './FloatingInput';
import PasswordInput from './PasswordInput';
import { CloseIcon } from './icons';

interface UserFormModalProps {
  user: UserAdmin | null;
  onClose: () => void;
  onSaved: () => void;
}

const ROL_OPTIONS: { value: Rol; label: string }[] = [
  { value: 'CLIENTE', label: 'Cliente' },
  { value: 'AJUSTADOR', label: 'Ajustador' },
  { value: 'ADMIN', label: 'Administrador' },
];

function extractErrorMessage(err: unknown, fallback: string): string {
  const message = (err as { response?: { data?: { message?: string | string[] } } })?.response?.data?.message;
  if (Array.isArray(message)) return message[0] ?? fallback;
  if (typeof message === 'string') return message;
  return fallback;
}

export default function UserFormModal({ user, onClose, onSaved }: UserFormModalProps) {
  const isEdit = !!user;
  const [nombre, setNombre] = useState(user?.nombre ?? '');
  const [email, setEmail] = useState(user?.email ?? '');
  const [password, setPassword] = useState('');
  const [rol, setRol] = useState<Rol>(user?.rol ?? 'CLIENTE');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      if (isEdit) {
        const payload: UpdateUserPayload = { nombre, email, rol };
        await adminUsersApi.update(user.id, payload);
      } else {
        const payload: CreateUserPayload = { nombre, email, password, rol };
        await adminUsersApi.create(payload);
      }
      onSaved();
    } catch (err) {
      setError(extractErrorMessage(err, 'No se pudo guardar el usuario.'));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div
      className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
          <h2 className="text-lg font-bold text-slate-900">{isEdit ? 'Editar usuario' : 'Nuevo usuario'}</h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg p-1.5 transition-colors"
            aria-label="Cerrar"
          >
            <CloseIcon />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <FloatingInput label="Nombre completo" value={nombre} onChange={(e) => setNombre(e.target.value)} required />
          <FloatingInput
            label="Correo electrónico"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          {!isEdit && (
            <PasswordInput
              label="Contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
              required
            />
          )}

          <div>
            <label className="block text-xs font-medium text-slate-500 uppercase tracking-wide mb-2">Rol</label>
            <div className="grid grid-cols-3 gap-2">
              {ROL_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setRol(opt.value)}
                  className={`text-sm font-medium rounded-xl py-2.5 border transition-colors ${
                    rol === opt.value
                      ? 'bg-indigo-600 border-indigo-600 text-white shadow-sm'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {error && (
            <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl px-3.5 py-2.5">{error}</div>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 border border-slate-200 rounded-xl py-2.5 text-sm text-slate-600 hover:bg-slate-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl py-2.5 text-sm font-semibold transition-colors"
            >
              {saving ? 'Guardando...' : isEdit ? 'Guardar cambios' : 'Crear usuario'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
