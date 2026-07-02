import type { HistorialItem } from '../types';
import { statusLabel } from './StatusBadge';

function fmtHora(iso: string) {
  return new Date(iso).toLocaleString('es-MX', {
    day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
  });
}

export default function HistorialTimeline({ historial }: { historial: HistorialItem[] }) {
  if (historial.length === 0) {
    return (
      <p className="text-sm text-slate-400 bg-slate-50 rounded-xl px-4 py-6 text-center">
        Aún no hay movimientos registrados.
      </p>
    );
  }

  return (
    <div className="relative">
      <div className="absolute left-[11px] top-2 bottom-2 w-px bg-slate-200" />
      <div className="space-y-5">
        {historial.map((h, idx) => (
          <div key={h.id} className="pl-7 relative">
            <div
              className={`absolute left-0 top-1.5 w-[22px] h-[22px] rounded-full border-2 border-white shadow flex items-center justify-center text-white text-[10px] font-bold ${
                idx === historial.length - 1 ? 'bg-indigo-500' : 'bg-slate-300'
              }`}
            >
              {idx + 1}
            </div>
            <p className="text-[11px] text-slate-400 mb-0.5">{fmtHora(h.fechaCambio)}</p>
            <p className="text-sm font-semibold text-slate-800">
              {h.estatusAnterior ? `${statusLabel(h.estatusAnterior)} → ${statusLabel(h.estatusNuevo)}` : statusLabel(h.estatusNuevo)}
            </p>
            {h.comentario && (
              <p className="text-sm text-slate-600 mt-1 bg-white rounded-xl px-3 py-2 border border-slate-100 leading-relaxed">
                "{h.comentario}"
              </p>
            )}
            <p className="text-[11px] text-slate-400 mt-1">Actualizado por {h.cambiadoPor.nombre}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
