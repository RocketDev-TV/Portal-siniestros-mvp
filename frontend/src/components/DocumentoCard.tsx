import { resolveFileUrl } from '../services/api';
import type { Documento, EstatusDocumento } from '../types';
import { CheckCircleIcon, DocumentIcon, XCircleIcon } from './icons';

interface DocumentoCardProps {
  documento: Documento;
  canValidate?: boolean;
  onApprove?: () => void;
  onReject?: () => void;
  updating?: boolean;
}

const ESTATUS_STYLE: Record<EstatusDocumento, string> = {
  PENDIENTE: 'bg-amber-100 text-amber-800',
  APROBADO: 'bg-green-100 text-green-800',
  RECHAZADO: 'bg-red-100 text-red-800',
};

const ESTATUS_LABEL: Record<EstatusDocumento, string> = {
  PENDIENTE: 'Pendiente',
  APROBADO: 'Aprobado',
  RECHAZADO: 'Rechazado',
};

function isImage(url: string) {
  return /\.(png|jpe?g|webp)$/i.test(url);
}

function fmt(iso: string) {
  return new Date(iso).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' });
}

export default function DocumentoCard({ documento, canValidate, onApprove, onReject, updating }: DocumentoCardProps) {
  const fileUrl = resolveFileUrl(documento.urlArchivo);
  const image = isImage(documento.urlArchivo);

  return (
    <div className="border border-slate-200 rounded-xl overflow-hidden bg-white">
      <a
        href={fileUrl}
        target="_blank"
        rel="noreferrer"
        className="block bg-slate-50 h-28 flex items-center justify-center overflow-hidden"
      >
        {image ? (
          <img src={fileUrl} alt={documento.tipo} className="w-full h-full object-cover" />
        ) : (
          <DocumentIcon className="w-10 h-10 text-slate-300" />
        )}
      </a>
      <div className="p-3">
        <div className="flex items-center justify-between gap-2 mb-1">
          <span className="text-xs font-semibold text-slate-700 truncate">{documento.tipo}</span>
          <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full shrink-0 ${ESTATUS_STYLE[documento.estatus]}`}>
            {ESTATUS_LABEL[documento.estatus]}
          </span>
        </div>
        <p className="text-[11px] text-slate-400">{fmt(documento.fechaSubida)}</p>
        {documento.comentario && (
          <p className="text-xs text-slate-500 mt-1.5 bg-slate-50 rounded-lg px-2 py-1.5">"{documento.comentario}"</p>
        )}

        {canValidate && documento.estatus === 'PENDIENTE' && (
          <div className="flex gap-1.5 mt-2.5">
            <button
              onClick={onApprove}
              disabled={updating}
              className="flex-1 flex items-center justify-center gap-1 text-xs font-medium text-green-700 bg-green-50 hover:bg-green-100 disabled:opacity-50 rounded-lg py-1.5 transition-colors"
            >
              <CheckCircleIcon className="w-3.5 h-3.5" /> Aprobar
            </button>
            <button
              onClick={onReject}
              disabled={updating}
              className="flex-1 flex items-center justify-center gap-1 text-xs font-medium text-red-700 bg-red-50 hover:bg-red-100 disabled:opacity-50 rounded-lg py-1.5 transition-colors"
            >
              <XCircleIcon className="w-3.5 h-3.5" /> Rechazar
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
