import { useEffect, useState } from 'react';
import { siniestrosApi } from '../services/api';
import type { EstatusSiniestro, Siniestro } from '../types';
import StatusBadge, { statusLabel } from '../components/StatusBadge';

const TODOS_ESTATUSES: EstatusSiniestro[] = [
  'REPORTADO', 'EN_REVISION', 'DOCUMENTOS_PENDIENTES', 'APROBADO', 'RECHAZADO', 'FINALIZADO',
];

interface ModalState {
  id: string;
  folio: string;
  estatusActual: EstatusSiniestro;
}

function fmt(iso: string) {
  return new Date(iso).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' });
}

export default function AjustadorDashboard() {
  const [siniestros, setSiniestros] = useState<Siniestro[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<ModalState | null>(null);
  const [nuevoEstatus, setNuevoEstatus] = useState<EstatusSiniestro>('EN_REVISION');
  const [comentario, setComentario] = useState('');
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  async function fetchSiniestros() {
    try {
      const { data } = await siniestrosApi.getAll();
      setSiniestros(data);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetchSiniestros(); }, []);

  function openModal(s: Siniestro) {
    const siguiente = TODOS_ESTATUSES.find(e => e !== s.estatus) ?? 'EN_REVISION';
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

  const activos = siniestros.filter(s => s.estatus !== 'FINALIZADO' && s.estatus !== 'RECHAZADO');
  const cerrados = siniestros.filter(s => s.estatus === 'FINALIZADO' || s.estatus === 'RECHAZADO');

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Mis Casos Asignados</h1>
        <p className="text-sm text-slate-500 mt-0.5">
          {activos.length} activos · {cerrados.length} cerrados
        </p>
      </div>

      {loading ? (
        <div className="text-center py-16 text-slate-400">Cargando casos...</div>
      ) : (
        <div className="space-y-6">
          {activos.length > 0 && (
            <section>
              <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Casos activos</h2>
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-left">
                      <th className="px-4 py-3 font-medium text-slate-500 text-xs uppercase tracking-wide">Folio</th>
                      <th className="px-4 py-3 font-medium text-slate-500 text-xs uppercase tracking-wide">Cliente</th>
                      <th className="px-4 py-3 font-medium text-slate-500 text-xs uppercase tracking-wide">Descripción</th>
                      <th className="px-4 py-3 font-medium text-slate-500 text-xs uppercase tracking-wide">Estatus</th>
                      <th className="px-4 py-3 font-medium text-slate-500 text-xs uppercase tracking-wide">Fecha</th>
                      <th className="px-4 py-3 font-medium text-slate-500 text-xs uppercase tracking-wide">Acción</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {activos.map((s) => (
                      <tr key={s.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-4 py-3.5 font-mono font-semibold text-indigo-700 text-xs">{s.folio}</td>
                        <td className="px-4 py-3.5 text-slate-800">{s.cliente.nombre}</td>
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
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {cerrados.length > 0 && (
            <section>
              <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">Casos cerrados</h2>
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden opacity-70">
                <table className="w-full text-sm">
                  <tbody className="divide-y divide-slate-100">
                    {cerrados.map((s) => (
                      <tr key={s.id} className="hover:bg-slate-50">
                        <td className="px-4 py-3 font-mono text-xs text-slate-400">{s.folio}</td>
                        <td className="px-4 py-3 text-slate-500">{s.cliente.nombre}</td>
                        <td className="px-4 py-3 text-slate-400 max-w-xs truncate">{s.descripcion}</td>
                        <td className="px-4 py-3"><StatusBadge estatus={s.estatus} /></td>
                        <td className="px-4 py-3 text-slate-400 text-xs">{fmt(s.fechaReporte)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {siniestros.length === 0 && (
            <div className="text-center py-14 text-slate-400 bg-white rounded-xl border border-slate-200">
              No tienes casos asignados aún.
            </div>
          )}
        </div>
      )}

      {modal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <h3 className="text-base font-bold text-slate-800 mb-1">Actualizar Estatus</h3>
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
                  className="w-full border border-slate-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {TODOS_ESTATUSES.filter(e => e !== modal.estatusActual).map(e => (
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
                  className="w-full border border-slate-300 rounded-xl px-3 py-2.5 text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                  placeholder="Documenta el motivo del cambio..."
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
                {saving ? 'Guardando...' : 'Confirmar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
