import { useEffect, useState } from 'react';
import { adminUsersApi, siniestrosApi } from '../services/api';
import type { EstatusSiniestro, Siniestro, UserAdmin } from '../types';
import StatusBadge, { statusLabel } from '../components/StatusBadge';
import MetricCard from '../components/MetricCard';
import RolBadge from '../components/RolBadge';
import UserFormModal from '../components/UserFormModal';
import ConfirmDialog from '../components/ConfirmDialog';
import { CheckCircleIcon, ClockIcon, FolderIcon, PencilIcon, PlusIcon, TrashIcon, UsersIcon, XCircleIcon } from '../components/icons';

const TODOS_ESTATUSES: EstatusSiniestro[] = [
  'REPORTADO', 'EN_REVISION', 'DOCUMENTOS_PENDIENTES', 'APROBADO', 'RECHAZADO', 'FINALIZADO',
];

interface ModalState {
  id: string;
  folio: string;
  estatusActual: EstatusSiniestro;
}

type Tab = 'resumen' | 'usuarios';

function fmt(iso: string) {
  return new Date(iso).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' });
}

export default function AdminDashboard() {
  const [tab, setTab] = useState<Tab>('resumen');

  const [siniestros, setSiniestros] = useState<Siniestro[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<ModalState | null>(null);
  const [nuevoEstatus, setNuevoEstatus] = useState<EstatusSiniestro>('EN_REVISION');
  const [comentario, setComentario] = useState('');
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const [usuarios, setUsuarios] = useState<UserAdmin[]>([]);
  const [loadingUsuarios, setLoadingUsuarios] = useState(true);
  const [userModal, setUserModal] = useState<'create' | UserAdmin | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<UserAdmin | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [userError, setUserError] = useState('');

  async function fetchSiniestros() {
    try {
      const { data } = await siniestrosApi.getAll();
      setSiniestros(data);
    } finally {
      setLoading(false);
    }
  }

  async function fetchUsuarios() {
    try {
      const { data } = await adminUsersApi.getAll();
      setUsuarios(data);
    } finally {
      setLoadingUsuarios(false);
    }
  }

  useEffect(() => {
    fetchSiniestros();
    fetchUsuarios();
  }, []);

  function openModal(s: Siniestro) {
    const siguiente = TODOS_ESTATUSES.find((e) => e !== s.estatus) ?? 'EN_REVISION';
    setModal({ id: s.id, folio: s.folio, estatusActual: s.estatus });
    setNuevoEstatus(siguiente);
    setComentario('');
    setErrorMsg('');
  }

  async function handleUpdate() {
    if (!modal) return;
    setSaving(true);
    setErrorMsg('');
    try {
      await siniestrosApi.updateEstatus(modal.id, nuevoEstatus, comentario || undefined);
      await fetchSiniestros();
      setModal(null);
    } catch {
      setErrorMsg('Error al actualizar. Intenta de nuevo.');
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteUser() {
    if (!deleteTarget) return;
    setDeleting(true);
    setUserError('');
    try {
      await adminUsersApi.remove(deleteTarget.id);
      await fetchUsuarios();
      setDeleteTarget(null);
    } catch (err) {
      const message = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setUserError(message ?? 'No se pudo eliminar el usuario.');
    } finally {
      setDeleting(false);
    }
  }

  const activos = siniestros.filter((s) => s.estatus !== 'FINALIZADO' && s.estatus !== 'RECHAZADO');
  const cerrados = siniestros.filter((s) => s.estatus === 'FINALIZADO' || s.estatus === 'RECHAZADO');
  const pendientesDocs = siniestros.filter((s) => s.estatus === 'DOCUMENTOS_PENDIENTES');

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Panel de Administración</h1>
          <p className="text-sm text-slate-500 mt-0.5">Vista general del portal de siniestros</p>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <MetricCard label="Total de siniestros" value={siniestros.length} icon={<FolderIcon />} accent="indigo" />
        <MetricCard label="Casos activos" value={activos.length} icon={<ClockIcon />} accent="amber" />
        <MetricCard label="Casos cerrados" value={cerrados.length} icon={<CheckCircleIcon />} accent="green" />
        <MetricCard label="Documentos pendientes" value={pendientesDocs.length} icon={<XCircleIcon />} accent="red" />
      </div>

      <div className="flex gap-1 border-b border-slate-200 mb-6">
        <button
          onClick={() => setTab('resumen')}
          className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
            tab === 'resumen' ? 'text-indigo-600 border-indigo-600' : 'text-slate-500 border-transparent hover:text-slate-700'
          }`}
        >
          Siniestros
        </button>
        <button
          onClick={() => setTab('usuarios')}
          className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
            tab === 'usuarios' ? 'text-indigo-600 border-indigo-600' : 'text-slate-500 border-transparent hover:text-slate-700'
          }`}
        >
          <UsersIcon className="w-4 h-4" /> Control de Usuarios
        </button>
      </div>

      {tab === 'resumen' && (
        loading ? (
          <div className="text-center py-16 text-slate-400">Cargando siniestros...</div>
        ) : (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-left">
                  <th className="px-4 py-3 font-medium text-slate-500 text-xs uppercase tracking-wide">Folio</th>
                  <th className="px-4 py-3 font-medium text-slate-500 text-xs uppercase tracking-wide">Cliente</th>
                  <th className="px-4 py-3 font-medium text-slate-500 text-xs uppercase tracking-wide">Ajustador</th>
                  <th className="px-4 py-3 font-medium text-slate-500 text-xs uppercase tracking-wide">Descripción</th>
                  <th className="px-4 py-3 font-medium text-slate-500 text-xs uppercase tracking-wide">Estatus</th>
                  <th className="px-4 py-3 font-medium text-slate-500 text-xs uppercase tracking-wide">Fecha</th>
                  <th className="px-4 py-3 font-medium text-slate-500 text-xs uppercase tracking-wide">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {siniestros.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3.5 font-mono font-semibold text-indigo-700 text-xs">{s.folio}</td>
                    <td className="px-4 py-3.5 text-slate-800">{s.cliente.nombre}</td>
                    <td className="px-4 py-3.5 text-slate-500">{s.ajustador?.nombre ?? <span className="text-slate-300">—</span>}</td>
                    <td className="px-4 py-3.5 text-slate-600 max-w-xs">
                      <span className="line-clamp-2">{s.descripcion}</span>
                    </td>
                    <td className="px-4 py-3.5"><StatusBadge estatus={s.estatus} /></td>
                    <td className="px-4 py-3.5 text-slate-400 whitespace-nowrap text-xs">{fmt(s.fechaReporte)}</td>
                    <td className="px-4 py-3.5">
                      <button
                        onClick={() => openModal(s)}
                        className="text-xs text-indigo-600 hover:text-indigo-800 font-medium border border-indigo-200 rounded-lg px-2.5 py-1 hover:bg-indigo-50 transition-colors whitespace-nowrap"
                      >
                        Cambiar estatus
                      </button>
                    </td>
                  </tr>
                ))}
                {siniestros.length === 0 && (
                  <tr>
                    <td colSpan={7} className="text-center py-14 text-slate-400">
                      No hay siniestros registrados aún.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )
      )}

      {tab === 'usuarios' && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-slate-500">{usuarios.length} usuarios registrados</p>
            <button
              onClick={() => setUserModal('create')}
              className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl px-4 py-2.5 transition-colors shadow-sm"
            >
              <PlusIcon className="w-4 h-4" /> Nuevo usuario
            </button>
          </div>

          {loadingUsuarios ? (
            <div className="text-center py-16 text-slate-400">Cargando usuarios...</div>
          ) : (
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-left">
                    <th className="px-4 py-3 font-medium text-slate-500 text-xs uppercase tracking-wide">Nombre</th>
                    <th className="px-4 py-3 font-medium text-slate-500 text-xs uppercase tracking-wide">Correo</th>
                    <th className="px-4 py-3 font-medium text-slate-500 text-xs uppercase tracking-wide">Rol</th>
                    <th className="px-4 py-3 font-medium text-slate-500 text-xs uppercase tracking-wide">Casos</th>
                    <th className="px-4 py-3 font-medium text-slate-500 text-xs uppercase tracking-wide">Alta</th>
                    <th className="px-4 py-3 font-medium text-slate-500 text-xs uppercase tracking-wide">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {usuarios.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3.5 font-medium text-slate-800">{u.nombre}</td>
                      <td className="px-4 py-3.5 text-slate-500">{u.email}</td>
                      <td className="px-4 py-3.5"><RolBadge rol={u.rol} /></td>
                      <td className="px-4 py-3.5 text-slate-500 text-xs">
                        {u.rol === 'CLIENTE' && `${u._count.siniestrosCliente} reportado(s)`}
                        {u.rol === 'AJUSTADOR' && `${u._count.siniestrosAsignados} asignado(s)`}
                        {u.rol === 'ADMIN' && <span className="text-slate-300">—</span>}
                      </td>
                      <td className="px-4 py-3.5 text-slate-400 whitespace-nowrap text-xs">{fmt(u.fechaCreacion)}</td>
                      <td className="px-4 py-3.5">
                        <div className="flex gap-1.5">
                          <button
                            onClick={() => setUserModal(u)}
                            className="text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg p-1.5 transition-colors"
                            aria-label="Editar usuario"
                          >
                            <PencilIcon />
                          </button>
                          <button
                            onClick={() => { setDeleteTarget(u); setUserError(''); }}
                            className="text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg p-1.5 transition-colors"
                            aria-label="Eliminar usuario"
                          >
                            <TrashIcon />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {usuarios.length === 0 && (
                    <tr>
                      <td colSpan={6} className="text-center py-14 text-slate-400">
                        No hay usuarios registrados aún.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {modal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <h3 className="text-base font-bold text-slate-800 mb-1">Cambiar Estatus</h3>
            <div className="flex items-center gap-2 mb-5">
              <span className="text-sm text-slate-500 font-mono">{modal.folio}</span>
              <span className="text-slate-300">·</span>
              <StatusBadge estatus={modal.estatusActual} />
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Nuevo estatus</label>
                <select
                  value={nuevoEstatus}
                  onChange={(e) => setNuevoEstatus(e.target.value as EstatusSiniestro)}
                  className="w-full border border-slate-300 rounded-xl px-3 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {TODOS_ESTATUSES.filter((e) => e !== modal.estatusActual).map((e) => (
                    <option key={e} value={e}>{statusLabel(e)}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Comentario <span className="font-normal text-slate-400">(opcional)</span>
                </label>
                <textarea
                  value={comentario}
                  onChange={(e) => setComentario(e.target.value)}
                  rows={3}
                  className="w-full border border-slate-300 rounded-xl px-3 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                  placeholder="Añade una nota visible en el historial..."
                />
              </div>
            </div>

            {errorMsg && (
              <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2 mt-3">{errorMsg}</p>
            )}

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setModal(null)}
                className="flex-1 border border-slate-200 rounded-xl py-2.5 text-sm text-slate-600 hover:bg-slate-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleUpdate}
                disabled={saving}
                className="flex-1 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl py-2.5 text-sm font-semibold transition-colors"
              >
                {saving ? 'Guardando...' : 'Confirmar cambio'}
              </button>
            </div>
          </div>
        </div>
      )}

      {userModal && (
        <UserFormModal
          user={userModal === 'create' ? null : userModal}
          onClose={() => setUserModal(null)}
          onSaved={() => { setUserModal(null); fetchUsuarios(); }}
        />
      )}

      {deleteTarget && (
        <ConfirmDialog
          title="Eliminar usuario"
          message={`¿Seguro que quieres eliminar a "${deleteTarget.nombre}"? Esta acción no se puede deshacer.`}
          confirmLabel="Eliminar"
          danger
          loading={deleting}
          error={userError}
          onConfirm={handleDeleteUser}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
}
