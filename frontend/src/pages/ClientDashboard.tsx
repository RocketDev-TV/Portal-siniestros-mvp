import { useEffect, useState } from 'react';
import { documentosApi, siniestrosApi } from '../services/api';
import type { Documento, Siniestro, SiniestroDetalle } from '../types';
import { extractErrorMessage } from '../utils/errors';
import StatusBadge from '../components/StatusBadge';
import DocumentoCard from '../components/DocumentoCard';
import DropzoneUpload from '../components/DropzoneUpload';
import HistorialTimeline from '../components/HistorialTimeline';
import ReportarSiniestroModal from '../components/ReportarSiniestroModal';
import ConfirmDialog from '../components/ConfirmDialog';
import { PlusIcon } from '../components/icons';

const TIPO_DOCUMENTO_OPTIONS = [
  { value: 'EVIDENCIA', label: 'Evidencia del siniestro' },
  { value: 'POLIZA', label: 'Póliza' },
  { value: 'IDENTIFICACION', label: 'Identificación oficial' },
];

type SubTab = 'historial' | 'documentos';

function fmt(iso: string) {
  return new Date(iso).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' });
}

export default function ClientDashboard() {
  const [siniestros, setSiniestros] = useState<Siniestro[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [subTab, setSubTab] = useState<SubTab>('historial');
  const [detalle, setDetalle] = useState<SiniestroDetalle | null>(null);
  const [loadingDetalle, setLoadingDetalle] = useState(false);
  const [reportModalOpen, setReportModalOpen] = useState(false);

  const [tipoDocumento, setTipoDocumento] = useState('EVIDENCIA');
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');

  const [deleteDocTarget, setDeleteDocTarget] = useState<Documento | null>(null);
  const [deletingDoc, setDeletingDoc] = useState(false);
  const [deleteDocError, setDeleteDocError] = useState('');

  async function fetchSiniestros() {
    setLoading(true);
    try {
      const { data } = await siniestrosApi.getAll();
      setSiniestros(data);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetchSiniestros(); }, []);

  async function toggleDetalle(id: string) {
    if (expandedId === id) {
      setExpandedId(null);
      setDetalle(null);
      return;
    }
    setExpandedId(id);
    setSubTab('historial');
    setDetalle(null);
    setUploadError('');
    setLoadingDetalle(true);
    try {
      const { data } = await siniestrosApi.getOne(id);
      setDetalle(data);
    } finally {
      setLoadingDetalle(false);
    }
  }

  async function handleUpload(siniestroId: string, file: File) {
    setUploading(true);
    setUploadError('');
    try {
      await documentosApi.upload(siniestroId, tipoDocumento, file);
      const { data } = await siniestrosApi.getOne(siniestroId);
      setDetalle(data);
      setSiniestros((prev) =>
        prev.map((s) => (s.id === siniestroId ? { ...s, _count: { ...s._count, documentos: s._count.documentos + 1 } } : s)),
      );
    } catch (err) {
      setUploadError(extractErrorMessage(err, 'No se pudo subir el archivo.'));
    } finally {
      setUploading(false);
    }
  }

  async function handleDeleteDoc() {
    if (!deleteDocTarget || !detalle) return;
    setDeletingDoc(true);
    setDeleteDocError('');
    try {
      await documentosApi.remove(deleteDocTarget.id);
      const { data } = await siniestrosApi.getOne(detalle.id);
      setDetalle(data);
      setSiniestros((prev) =>
        prev.map((s) => (s.id === detalle.id ? { ...s, _count: { ...s._count, documentos: s._count.documentos - 1 } } : s)),
      );
      setDeleteDocTarget(null);
    } catch (err) {
      setDeleteDocError(extractErrorMessage(err, 'No se pudo eliminar el documento.'));
    } finally {
      setDeletingDoc(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-start justify-between mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Mis Siniestros</h1>
          <p className="text-sm text-slate-500 mt-0.5">Seguimiento en tiempo real de tus casos</p>
        </div>
        <button
          onClick={() => setReportModalOpen(true)}
          className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl px-4 py-2.5 transition-colors shadow-sm shrink-0"
        >
          <PlusIcon className="w-4 h-4" /> Reportar siniestro
        </button>
      </div>

      {loading ? (
        <div className="text-center py-16 text-slate-400">Cargando tus casos...</div>
      ) : siniestros.length === 0 ? (
        <div className="text-center py-16 text-slate-400 bg-white rounded-2xl border border-slate-200">
          No tienes siniestros registrados.<br />
          <span className="text-sm">Reporta tu primer caso con el botón de arriba.</span>
        </div>
      ) : (
        <div className="space-y-3">
          {siniestros.map((s) => (
            <div key={s.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-5">
                <div className="flex items-start gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-2">
                      <span className="font-mono text-xs font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md">
                        {s.folio}
                      </span>
                      <StatusBadge estatus={s.estatus} />
                    </div>
                    <p className="text-sm text-slate-700 leading-relaxed">{s.descripcion}</p>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2.5 text-xs text-slate-400">
                      <span>Reportado el {fmt(s.fechaReporte)}</span>
                      <span>{s._count.documentos} documento{s._count.documentos !== 1 ? 's' : ''}</span>
                    </div>
                    {s.ajustador && (
                      <div className="mt-3 bg-indigo-50/60 border border-indigo-100 rounded-xl px-3 py-2">
                        <p className="text-[11px] font-semibold text-indigo-700 uppercase tracking-wide mb-0.5">
                          Tu ajustador asignado
                        </p>
                        <p className="text-sm text-slate-700 font-medium">{s.ajustador.nombre}</p>
                        <div className="flex flex-wrap gap-x-3 text-xs text-slate-500 mt-0.5">
                          <span>{s.ajustador.email}</span>
                          {s.ajustador.telefono && <span>{s.ajustador.telefono}</span>}
                        </div>
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => toggleDetalle(s.id)}
                    className="flex-shrink-0 text-xs text-indigo-600 hover:text-indigo-800 font-semibold border border-indigo-200 rounded-xl px-3 py-1.5 hover:bg-indigo-50 transition-colors"
                  >
                    {expandedId === s.id ? 'Ocultar ↑' : 'Ver detalle ↓'}
                  </button>
                </div>
              </div>

              {expandedId === s.id && (
                <div className="border-t border-slate-100 bg-slate-50/80">
                  <div className="flex px-5 pt-3 gap-1 border-b border-slate-200/70">
                    <button
                      onClick={() => setSubTab('historial')}
                      className={`px-3 py-2 text-xs font-semibold uppercase tracking-wide border-b-2 transition-colors ${
                        subTab === 'historial' ? 'text-indigo-600 border-indigo-600' : 'text-slate-400 border-transparent hover:text-slate-600'
                      }`}
                    >
                      Historial
                    </button>
                    <button
                      onClick={() => setSubTab('documentos')}
                      className={`px-3 py-2 text-xs font-semibold uppercase tracking-wide border-b-2 transition-colors ${
                        subTab === 'documentos' ? 'text-indigo-600 border-indigo-600' : 'text-slate-400 border-transparent hover:text-slate-600'
                      }`}
                    >
                      Documentos
                    </button>
                  </div>

                  <div className="px-5 py-4">
                    {loadingDetalle && !detalle ? (
                      <p className="text-sm text-slate-400 text-center py-3">Cargando...</p>
                    ) : detalle && detalle.id === s.id ? (
                      subTab === 'historial' ? (
                        <HistorialTimeline historial={detalle.historial} />
                      ) : (
                        <div className="space-y-4">
                          {detalle.documentos.length > 0 && (
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                              {detalle.documentos.map((doc) => (
                                <DocumentoCard
                                  key={doc.id}
                                  documento={doc}
                                  canDelete
                                  onDelete={() => { setDeleteDocTarget(doc); setDeleteDocError(''); }}
                                />
                              ))}
                            </div>
                          )}

                          <div>
                            <label className="block text-xs font-medium text-slate-500 uppercase tracking-wide mb-1.5">
                              Tipo de documento
                            </label>
                            <select
                              value={tipoDocumento}
                              onChange={(e) => setTipoDocumento(e.target.value)}
                              className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 mb-3"
                            >
                              {TIPO_DOCUMENTO_OPTIONS.map((opt) => (
                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                              ))}
                            </select>
                            <DropzoneUpload uploading={uploading} onFileSelected={(file) => handleUpload(s.id, file)} />
                            {uploadError && (
                              <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2 mt-2">
                                {uploadError}
                              </p>
                            )}
                          </div>
                        </div>
                      )
                    ) : null}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {reportModalOpen && (
        <ReportarSiniestroModal
          onClose={() => setReportModalOpen(false)}
          onCreated={() => { setReportModalOpen(false); fetchSiniestros(); }}
        />
      )}

      {deleteDocTarget && (
        <ConfirmDialog
          title="Eliminar documento"
          message={`¿Seguro que quieres eliminar "${deleteDocTarget.tipo}"? Esta acción no se puede deshacer.`}
          confirmLabel="Eliminar"
          danger
          loading={deletingDoc}
          error={deleteDocError}
          onConfirm={handleDeleteDoc}
          onCancel={() => setDeleteDocTarget(null)}
        />
      )}
    </div>
  );
}
