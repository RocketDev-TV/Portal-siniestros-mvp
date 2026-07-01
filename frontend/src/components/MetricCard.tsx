import type { ReactNode } from 'react';

interface MetricCardProps {
  label: string;
  value: number | string;
  icon: ReactNode;
  accent: 'indigo' | 'green' | 'red' | 'amber' | 'slate';
}

const ACCENT_STYLES: Record<MetricCardProps['accent'], string> = {
  indigo: 'bg-indigo-50 text-indigo-600',
  green: 'bg-green-50 text-green-600',
  red: 'bg-red-50 text-red-600',
  amber: 'bg-amber-50 text-amber-600',
  slate: 'bg-slate-100 text-slate-500',
};

export default function MetricCard({ label, value, icon, accent }: MetricCardProps) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 flex items-center gap-4">
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${ACCENT_STYLES[accent]}`}>
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-2xl font-bold text-slate-800 leading-tight">{value}</p>
        <p className="text-xs text-slate-500 truncate">{label}</p>
      </div>
    </div>
  );
}
