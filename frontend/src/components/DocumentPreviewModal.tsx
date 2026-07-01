import { resolveFileUrl } from '../services/api';
import type { Documento } from '../types';
import { CloseIcon } from './icons';

interface DocumentPreviewModalProps {
  documento: Documento;
  onClose: () => void;
}

const TIPO_LABEL: Record<string, string> = {
  EVIDENCIA: 'Evidencia del siniestro',
  POLIZA: 'Póliza',
  IDENTIFICACION: 'Identificación oficial',
};

function isImage(url: string) {
  return /\.(png|jpe?g|webp)$/i.test(url);
}

export default function DocumentPreviewModal({ documento, onClose }: DocumentPreviewModalProps) {
  const fileUrl = resolveFileUrl(documento.urlArchivo);
  const image = isImage(documento.urlArchivo);

  return (
    <div
      className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center z-[70] p-4 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 shrink-0">
          <div>
            <p className="text-sm font-semibold text-slate-800">{TIPO_LABEL[documento.tipo] ?? documento.tipo}</p>
            <a href={fileUrl} target="_blank" rel="noreferrer" className="text-xs text-indigo-600 hover:text-indigo-800">
              Abrir en una pestaña nueva ↗
            </a>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg p-1.5 transition-colors"
            aria-label="Cerrar"
          >
            <CloseIcon />
          </button>
        </div>

        <div className="flex-1 overflow-auto bg-slate-100 flex items-center justify-center">
          {image ? (
            <img src={fileUrl} alt={documento.tipo} className="max-w-full max-h-[75vh] object-contain" />
          ) : (
            <iframe src={fileUrl} title={documento.tipo} className="w-full h-[75vh] bg-white" />
          )}
        </div>
      </div>
    </div>
  );
}
