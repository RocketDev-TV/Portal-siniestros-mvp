import { useRef, useState } from 'react';
import type { DragEvent } from 'react';
import { CloudUploadIcon } from './icons';

interface DropzoneUploadProps {
  onFileSelected: (file: File) => void;
  uploading?: boolean;
}

const ACCEPTED = '.pdf,.jpg,.jpeg,.png,.webp';

export default function DropzoneUpload({ onFileSelected, uploading }: DropzoneUploadProps) {
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  function handleDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) onFileSelected(file);
  }

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setDragOver(true);
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={handleDrop}
      onClick={() => !uploading && inputRef.current?.click()}
      className={`flex flex-col items-center justify-center gap-2 border-2 border-dashed rounded-2xl px-6 py-8 text-center cursor-pointer transition-colors ${
        dragOver ? 'border-indigo-400 bg-indigo-50' : 'border-slate-200 hover:border-indigo-300 hover:bg-slate-50'
      }`}
    >
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED}
        className="hidden"
        disabled={uploading}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) onFileSelected(file);
          e.target.value = '';
        }}
      />
      <CloudUploadIcon className={`w-8 h-8 ${dragOver ? 'text-indigo-500' : 'text-slate-300'}`} />
      {uploading ? (
        <p className="text-sm text-slate-500">Subiendo archivo...</p>
      ) : (
        <>
          <p className="text-sm font-medium text-slate-600">Arrastra un archivo aquí o haz clic para seleccionar</p>
          <p className="text-xs text-slate-400">PDF, JPG, PNG o WEBP · máx. 10MB</p>
        </>
      )}
    </div>
  );
}
