import { useId } from 'react';
import type { InputHTMLAttributes } from 'react';

interface FloatingInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export default function FloatingInput({ label, error, className = '', id, ...props }: FloatingInputProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;

  return (
    <div>
      <div className="relative">
        <input
          id={inputId}
          placeholder=" "
          className={`peer w-full rounded-xl border bg-white/80 px-3.5 pt-5 pb-2 text-sm text-slate-800 placeholder-transparent outline-none transition-all focus:bg-white ${
            error
              ? 'border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-100'
              : 'border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100'
          } ${className}`}
          {...props}
        />
        <label
          htmlFor={inputId}
          className="pointer-events-none absolute left-3.5 top-2 text-xs font-medium text-slate-500 transition-all peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-sm peer-placeholder-shown:text-slate-400 peer-focus:top-2 peer-focus:text-xs peer-focus:text-indigo-600"
        >
          {label}
        </label>
      </div>
      {error && <p className="mt-1.5 text-xs text-red-600">{error}</p>}
    </div>
  );
}
