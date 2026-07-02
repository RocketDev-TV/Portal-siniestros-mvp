import { useEffect, useState } from 'react';
import { documentosApi, siniestrosApi } from '../services/api';
import type { EstatusSiniestro, SiniestroDetalle } from '../types';
import StatusBadge, { statusLabel } from './StatusBadge';
import DocumentoCard from './DocumentoCard';
import HistorialTimeline from './HistorialTimeline';
import { CloseIcon } from './icons';

const TODOS_ESTATUSES: EstatusSiniestro[] = [
  'REPORTADO', 'EN_REVISION', 'DOCUMENTOS_PENDIENTES', 'APROBADO', 'RECHAZADO', 'FINALIZADO',
];

interface AjustadorCaseModalProps {
  siniestroId: string;
  onClose: () => void;
  onUpdated: () => void;
}

export default function AjustadorCaseModal({ siniestroId, onClose, onUpdated }: AjustadorCaseModalProps) {
  const [detalle, setDetalle] = useState<SiniestroDetalle | null>(null);
  const [loading, setLoading] = useState(true);
  const [updatingDocId, setUpdatingDocId] = useState<string | null>(null);

  const [nuevoEstatus, setNuevoEstatus] = useState<EstatusSiniestro>('EN_REVISION');
  const [comentario, setComentario] = useState('');
  const [savingEstatus, setSavingEstatus] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  async function fetchDetalle() {
    setLoading(true);
    try {
      const { data } = await siniestrosApi.getOne(siniestroId);
      setDetalle(data);
      setNuevoEstatus(TODOS_ESTATUSES.find((e) => e !== data.estatus) ?? 'EN_REVISION');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchDetalle();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [siniestroId]);

  async function handleValidateDoc(docId: string, estatus: 'APROBADO' | 'RECHAZADO') {
    setUpdatingDocId(docId);
    try {
      await documentosApi.updateEstatus(docId, estatus);
      await fetchDetalle();
    } finally {
      setUpdatingDocId(null);
    }
  }

  async function handleUpdateEstatus() {
    if (!detalle) return;
    setSavingEstatus(true);
    setErrorMsg('');
    try {
      await siniestrosApi.updateEstatus(detalle.id, nuevoEstatus, comentario || undefined);
      setComentario('');
      await fetchDetalle();
      onUpdated();
    } catch {
      setErrorMsg('Error al actualizar el estatus. Intenta de nuevo.');
    } finally {
      setSavingEstatus(false);
    }
  }

  return (
    <div
      className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        {loading || !detalle ? (
          <div className="p-10 text-center text-slate-400">Cargando caso...</div>
        ) : (
          <>
            <div className="flex items-start justify-between px-6 py-5 border-b border-slate-100 sticky top-0 bg-white z-10">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-mono text-xs font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md">
                    {detalle.folio}
                  </span>
                  <StatusBadge estatus={detalle.estatus} />
                </div>
                <p className="text-sm text-slate-600 max-w-md">{detalle.descripcion}</p>
                <div className="flex flex-wrap gap-x-3 text-xs text-slate-400 mt-1">
                  <span>Cliente: {detalle.cliente.nombre}</span>
                  <span>{detalle.cliente.email}</span>
                  {detalle.cliente.telefono && <span>{detalle.cliente.telefono}</span>}
                </div>
              </div>
              <button
                onClick={onClose}
                className="text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg p-1.5 transition-colors"
                aria-label="Cerrar"
              >
                <CloseIcon />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <section>
                <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">
                  Documentos ({detalle.documentos.length})
                </h3>
                {detalle.documentos.length === 0 ? (
                  <p className="text-sm text-slate-400 bg-slate-50 rounded-xl px-4 py-6 text-center">
                    El cliente aún no ha subido documentos.
                  </p>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {detalle.documentos.map((doc) => (
                      <DocumentoCard
                        key={doc.id}
                        documento={doc}
                        canValidate
                        updating={updatingDocId === doc.id}
                        onApprove={() => handleValidateDoc(doc.id, 'APROBADO')}
                        onReject={() => handleValidateDoc(doc.id, 'RECHAZADO')}
                      />
                    ))}
                  </div>
                )}
              </section>

              <section className="border-t border-slate-100 pt-5">
                <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">
                  Historial del caso
                </h3>
                <HistorialTimeline historial={detalle.historial} />
              </section>

              <section className="border-t border-slate-100 pt-5">
                <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">
                  Actualizar estatus del caso
                </h3>
                <div className="space-y-3">
                  <select
                    value={nuevoEstatus}
                    onChange={(e) => setNuevoEstatus(e.target.value as EstatusSiniestro)}
                    className="w-full border border-slate-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    {TODOS_ESTATUSES.filter((e) => e !== detalle.estatus).map((e) => (
                      <option key={e} value={e}>{statusLabel(e)}</option>
                    ))}
                  </select>
                  <textarea
                    value={comentario}
                    onChange={(e) => setComentario(e.target.value)}
                    rows={2}
                    className="w-full border border-slate-300 rounded-xl px-3 py-2.5 text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                    placeholder="Documenta el motivo del cambio (opcional)..."
                  />
                  {errorMsg && (
                    <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{errorMsg}</p>
                  )}
                  <button
                    onClick={handleUpdateEstatus}
                    disabled={savingEstatus}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl py-2.5 text-sm font-semibold transition-colors"
                  >
                    {savingEstatus ? 'Guardando...' : 'Actualizar estatus'}
                  </button>
                </div>
              </section>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
