import { useState } from 'react';
import { siniestrosApi } from '../services/api';
import { extractErrorMessage } from '../utils/errors';
import { CloseIcon } from './icons';

interface ReportarSiniestroModalProps {
  onClose: () => void;
  onCreated: () => void;
}

const HOY = new Date().toISOString().slice(0, 10);

export default function ReportarSiniestroModal({ onClose, onCreated }: ReportarSiniestroModalProps) {
  const [descripcion, setDescripcion] = useState('');
  const [fechaFalla, setFechaFalla] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      await siniestrosApi.create({ descripcion, fechaFalla: fechaFalla || undefined });
      onCreated();
    } catch (err) {
      setError(extractErrorMessage(err, 'No se pudo reportar el siniestro.'));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div
      className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Reportar nuevo siniestro</h2>
            <p className="text-xs text-slate-500 mt-0.5">Un ajustador será asignado automáticamente</p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg p-1.5 transition-colors"
            aria-label="Cerrar"
          >
            <CloseIcon />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Descripción del siniestro</label>
            <textarea
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              rows={4}
              required
              className="w-full border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
              placeholder="Describe qué ocurrió, cuándo y dónde..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Fecha del siniestro <span className="font-normal text-slate-400">(opcional)</span>
            </label>
            <input
              type="date"
              value={fechaFalla}
              max={HOY}
              onChange={(e) => setFechaFalla(e.target.value)}
              className="w-full border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {error && (
            <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl px-3.5 py-2.5">{error}</div>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 border border-slate-200 rounded-xl py-2.5 text-sm text-slate-600 hover:bg-slate-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl py-2.5 text-sm font-semibold transition-colors"
            >
              {saving ? 'Enviando...' : 'Reportar siniestro'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
