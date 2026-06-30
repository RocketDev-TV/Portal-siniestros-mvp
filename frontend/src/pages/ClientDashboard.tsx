import { useEffect, useState } from 'react';
import { siniestrosApi } from '../services/api';
import type { EstatusSiniestro, Siniestro, SiniestroDetalle } from '../types';
import StatusBadge from '../components/StatusBadge';

const ESTATUS_LABEL: Record<EstatusSiniestro, string> = {
  REPORTADO: 'Reportado',
  EN_REVISION: 'En Revisión',
  DOCUMENTOS_PENDIENTES: 'Docs. Pendientes',
  APROBADO: 'Aprobado',
  RECHAZADO: 'Rechazado',
  FINALIZADO: 'Finalizado',
};

function fmt(iso: string) {
  return new Date(iso).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' });
}

function fmtHora(iso: string) {
  return new Date(iso).toLocaleString('es-MX', {
    day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
  });
}

export default function ClientDashboard() {
  const [siniestros, setSiniestros] = useState<Siniestro[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [detalle, setDetalle] = useState<SiniestroDetalle | null>(null);
  const [loadingDetalle, setLoadingDetalle] = useState(false);

  useEffect(() => {
    siniestrosApi.getAll()
      .then(({ data }) => setSiniestros(data))
      .finally(() => setLoading(false));
  }, []);

  async function toggleDetalle(id: string) {
    if (expandedId === id) {
      setExpandedId(null);
      setDetalle(null);
      return;
    }
    setExpandedId(id);
    setDetalle(null);
    setLoadingDetalle(true);
    try {
      const { data } = await siniestrosApi.getOne(id);
      setDetalle(data);
    } finally {
      setLoadingDetalle(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Mis Siniestros</h1>
        <p className="text-sm text-slate-500 mt-0.5">Seguimiento en tiempo real de tus casos</p>
      </div>

      {loading ? (
        <div className="text-center py-16 text-slate-400">Cargando tus casos...</div>
      ) : siniestros.length === 0 ? (
        <div className="text-center py-16 text-slate-400 bg-white rounded-2xl border border-slate-200">
          No tienes siniestros registrados.<br />
          <span className="text-sm">Contacta a tu ajustador para abrir un caso.</span>
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
                      {s.ajustador && <span>Ajustador: {s.ajustador.nombre}</span>}
                      <span>{s._count.historial} cambio{s._count.historial !== 1 ? 's' : ''}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => toggleDetalle(s.id)}
                    className="flex-shrink-0 text-xs text-indigo-600 hover:text-indigo-800 font-semibold border border-indigo-200 rounded-xl px-3 py-1.5 hover:bg-indigo-50 transition-colors"
                  >
                    {expandedId === s.id ? 'Ocultar ↑' : 'Ver historial ↓'}
                  </button>
                </div>
              </div>

              {expandedId === s.id && (
                <div className="border-t border-slate-100 bg-slate-50/80 px-5 py-4">
                  {loadingDetalle && !detalle ? (
                    <p className="text-sm text-slate-400 text-center py-3">Cargando historial...</p>
                  ) : detalle && detalle.id === s.id ? (
                    <div>
                      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-4">
                        Historial de cambios
                      </p>
                      <div className="relative">
                        <div className="absolute left-[11px] top-2 bottom-2 w-px bg-slate-200" />
                        <div className="space-y-5">
                          {detalle.historial.map((h, idx) => (
                            <div key={h.id} className="pl-7 relative">
                              <div className={`absolute left-0 top-1.5 w-[22px] h-[22px] rounded-full border-2 border-white shadow flex items-center justify-center text-white text-[10px] font-bold ${idx === detalle.historial.length - 1 ? 'bg-indigo-500' : 'bg-slate-300'}`}>
                                {idx + 1}
                              </div>
                              <p className="text-[11px] text-slate-400 mb-0.5">{fmtHora(h.fechaCambio)}</p>
                              <p className="text-sm font-semibold text-slate-800">
                                {h.estatusAnterior
                                  ? `${ESTATUS_LABEL[h.estatusAnterior]} → ${ESTATUS_LABEL[h.estatusNuevo]}`
                                  : ESTATUS_LABEL[h.estatusNuevo]}
                              </p>
                              {h.comentario && (
                                <p className="text-sm text-slate-600 mt-1 bg-white rounded-xl px-3 py-2 border border-slate-100 leading-relaxed">
                                  "{h.comentario}"
                                </p>
                              )}
                              <p className="text-[11px] text-slate-400 mt-1">
                                Actualizado por {h.cambiadoPor.nombre}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : null}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
