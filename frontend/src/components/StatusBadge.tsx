import type { EstatusSiniestro } from '../types';

const CONFIG: Record<EstatusSiniestro, { label: string; className: string }> = {
  REPORTADO:             { label: 'Reportado',         className: 'bg-amber-100 text-amber-800' },
  EN_REVISION:           { label: 'En Revisión',       className: 'bg-blue-100 text-blue-800' },
  DOCUMENTOS_PENDIENTES: { label: 'Docs. Pendientes',  className: 'bg-orange-100 text-orange-800' },
  APROBADO:              { label: 'Aprobado',           className: 'bg-green-100 text-green-800' },
  RECHAZADO:             { label: 'Rechazado',          className: 'bg-red-100 text-red-800' },
  FINALIZADO:            { label: 'Finalizado',         className: 'bg-slate-100 text-slate-600' },
};

export function statusLabel(estatus: EstatusSiniestro): string {
  return CONFIG[estatus]?.label ?? estatus;
}

export default function StatusBadge({ estatus }: { estatus: EstatusSiniestro }) {
  const { label, className } = CONFIG[estatus] ?? { label: estatus, className: 'bg-slate-100 text-slate-600' };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${className}`}>
      {label}
    </span>
  );
}
