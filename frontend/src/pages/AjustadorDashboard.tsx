import { useEffect, useState } from 'react';
import { siniestrosApi } from '../services/api';
import type { Siniestro } from '../types';
import StatusBadge from '../components/StatusBadge';
import AjustadorCaseModal from '../components/AjustadorCaseModal';

function fmt(iso: string) {
  return new Date(iso).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' });
}

export default function AjustadorDashboard() {
  const [siniestros, setSiniestros] = useState<Siniestro[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCaseId, setActiveCaseId] = useState<string | null>(null);

  async function fetchSiniestros() {
    try {
      const { data } = await siniestrosApi.getAll();
      setSiniestros(data);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetchSiniestros(); }, []);

  const activos = siniestros.filter((s) => s.estatus !== 'FINALIZADO' && s.estatus !== 'RECHAZADO');
  const cerrados = siniestros.filter((s) => s.estatus === 'FINALIZADO' || s.estatus === 'RECHAZADO');

  function renderTabla(lista: Siniestro[], atenuado = false) {
    return (
      <div className={`bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden ${atenuado ? 'opacity-70' : ''}`}>
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-left">
              <th className="px-4 py-3 font-medium text-slate-500 text-xs uppercase tracking-wide">Folio</th>
              <th className="px-4 py-3 font-medium text-slate-500 text-xs uppercase tracking-wide">Cliente</th>
              <th className="px-4 py-3 font-medium text-slate-500 text-xs uppercase tracking-wide">Descripción</th>
              <th className="px-4 py-3 font-medium text-slate-500 text-xs uppercase tracking-wide">Documentos</th>
              <th className="px-4 py-3 font-medium text-slate-500 text-xs uppercase tracking-wide">Estatus</th>
              <th className="px-4 py-3 font-medium text-slate-500 text-xs uppercase tracking-wide">Fecha</th>
              <th className="px-4 py-3 font-medium text-slate-500 text-xs uppercase tracking-wide">Acción</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {lista.map((s) => (
              <tr key={s.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-4 py-3.5 font-mono font-semibold text-indigo-700 text-xs">{s.folio}</td>
                <td className="px-4 py-3.5 text-slate-800">{s.cliente.nombre}</td>
                <td className="px-4 py-3.5 text-slate-600 max-w-xs">
                  <span className="line-clamp-2">{s.descripcion}</span>
                </td>
                <td className="px-4 py-3.5 text-slate-500 text-xs">{s._count.documentos} archivo(s)</td>
                <td className="px-4 py-3.5"><StatusBadge estatus={s.estatus} /></td>
                <td className="px-4 py-3.5 text-slate-400 whitespace-nowrap text-xs">{fmt(s.fechaReporte)}</td>
                <td className="px-4 py-3.5">
                  <button
                    onClick={() => setActiveCaseId(s.id)}
                    className="text-xs text-indigo-600 hover:text-indigo-800 font-medium border border-indigo-200 rounded-lg px-2.5 py-1 hover:bg-indigo-50 transition-colors whitespace-nowrap"
                  >
                    Ver caso
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

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
              {renderTabla(activos)}
            </section>
          )}

          {cerrados.length > 0 && (
            <section>
              <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">Casos cerrados</h2>
              {renderTabla(cerrados, true)}
            </section>
          )}

          {siniestros.length === 0 && (
            <div className="text-center py-14 text-slate-400 bg-white rounded-xl border border-slate-200">
              No tienes casos asignados aún.
            </div>
          )}
        </div>
      )}

      {activeCaseId && (
        <AjustadorCaseModal
          siniestroId={activeCaseId}
          onClose={() => setActiveCaseId(null)}
          onUpdated={fetchSiniestros}
        />
      )}
    </div>
  );
}
