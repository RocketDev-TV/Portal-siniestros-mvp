import { useEffect, useState } from 'react';
import { usersApi } from '../services/api';
import type { AuthUser } from '../types';
import FloatingInput from './FloatingInput';
import PasswordInput from './PasswordInput';
import { CheckCircleIcon, CloseIcon, LockClosedIcon, UserCircleIcon } from './icons';
import { extractErrorMessage } from '../utils/errors';

interface ProfileModalProps {
  user: AuthUser;
  onClose: () => void;
  onUpdated: (user: AuthUser) => void;
}

type Tab = 'datos' | 'seguridad';

export default function ProfileModal({ user, onClose, onUpdated }: ProfileModalProps) {
  const [tab, setTab] = useState<Tab>('datos');

  const [nombre, setNombre] = useState(user.nombre);
  const [email, setEmail] = useState(user.email);
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileError, setProfileError] = useState('');
  const [profileSuccess, setProfileSuccess] = useState(false);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [savingPassword, setSavingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState(false);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  async function handleSaveProfile(e: React.FormEvent) {
    e.preventDefault();
    setProfileError('');
    setProfileSuccess(false);
    setSavingProfile(true);
    try {
      const { data } = await usersApi.updateProfile({ nombre, email });
      const updatedUser: AuthUser = { id: data.id, email: data.email, nombre: data.nombre, rol: data.rol };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      onUpdated(updatedUser);
      setProfileSuccess(true);
      setTimeout(() => setProfileSuccess(false), 2500);
    } catch (err) {
      setProfileError(extractErrorMessage(err, 'No se pudo actualizar tu información.'));
    } finally {
      setSavingProfile(false);
    }
  }

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess(false);

    if (newPassword.length < 6) {
      setPasswordError('La nueva contraseña debe tener al menos 6 caracteres.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('Las contraseñas no coinciden.');
      return;
    }

    setSavingPassword(true);
    try {
      await usersApi.changePassword({ currentPassword, newPassword });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setPasswordSuccess(true);
      setTimeout(() => setPasswordSuccess(false), 2500);
    } catch (err) {
      setPasswordError(extractErrorMessage(err, 'No se pudo actualizar tu contraseña.'));
    } finally {
      setSavingPassword(false);
    }
  }

  return (
    <div
      className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Mi cuenta</h2>
            <p className="text-xs text-slate-500 mt-0.5">Administra tu información y seguridad</p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg p-1.5 transition-colors"
            aria-label="Cerrar"
          >
            <CloseIcon />
          </button>
        </div>

        <div className="flex px-6 pt-4 gap-1 border-b border-slate-100">
          <button
            onClick={() => setTab('datos')}
            className={`flex items-center gap-1.5 px-3.5 py-2.5 text-sm font-medium rounded-t-lg transition-colors border-b-2 ${
              tab === 'datos' ? 'text-indigo-600 border-indigo-600' : 'text-slate-500 border-transparent hover:text-slate-700'
            }`}
          >
            <UserCircleIcon className="w-4 h-4" /> Datos personales
          </button>
          <button
            onClick={() => setTab('seguridad')}
            className={`flex items-center gap-1.5 px-3.5 py-2.5 text-sm font-medium rounded-t-lg transition-colors border-b-2 ${
              tab === 'seguridad' ? 'text-indigo-600 border-indigo-600' : 'text-slate-500 border-transparent hover:text-slate-700'
            }`}
          >
            <LockClosedIcon className="w-4 h-4" /> Seguridad
          </button>
        </div>

        <div className="p-6">
          {tab === 'datos' && (
            <form onSubmit={handleSaveProfile} className="space-y-4">
              <FloatingInput label="Nombre completo" value={nombre} onChange={(e) => setNombre(e.target.value)} required />
              <FloatingInput
                label="Correo electrónico"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />

              {profileError && (
                <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl px-3.5 py-2.5">{profileError}</div>
              )}
              {profileSuccess && (
                <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 border border-green-200 rounded-xl px-3.5 py-2.5">
                  <CheckCircleIcon className="w-4 h-4" /> Información actualizada correctamente.
                </div>
              )}

              <button
                type="submit"
                disabled={savingProfile}
                className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl py-2.5 text-sm font-semibold transition-colors shadow-sm"
              >
                {savingProfile ? 'Guardando...' : 'Guardar cambios'}
              </button>
            </form>
          )}

          {tab === 'seguridad' && (
            <form onSubmit={handleChangePassword} className="space-y-4">
              <PasswordInput
                label="Contraseña actual"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                autoComplete="current-password"
                required
              />
              <PasswordInput
                label="Nueva contraseña"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                autoComplete="new-password"
                required
              />
              <PasswordInput
                label="Confirmar nueva contraseña"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                autoComplete="new-password"
                required
              />

              {passwordError && (
                <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl px-3.5 py-2.5">{passwordError}</div>
              )}
              {passwordSuccess && (
                <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 border border-green-200 rounded-xl px-3.5 py-2.5">
                  <CheckCircleIcon className="w-4 h-4" /> Contraseña actualizada correctamente.
                </div>
              )}

              <button
                type="submit"
                disabled={savingPassword}
                className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl py-2.5 text-sm font-semibold transition-colors shadow-sm"
              >
                {savingPassword ? 'Actualizando...' : 'Actualizar contraseña'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
