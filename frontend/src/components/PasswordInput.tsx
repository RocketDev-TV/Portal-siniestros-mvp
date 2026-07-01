import { useState } from 'react';
import type { InputHTMLAttributes } from 'react';
import FloatingInput from './FloatingInput';
import { EyeIcon, EyeOffIcon } from './icons';

interface PasswordInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label: string;
  error?: string;
}

export default function PasswordInput({ label, error, className = '', ...props }: PasswordInputProps) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="relative">
      <FloatingInput label={label} error={error} type={visible ? 'text' : 'password'} className={`pr-11 ${className}`} {...props} />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        tabIndex={-1}
        aria-label={visible ? 'Ocultar contraseña' : 'Mostrar contraseña'}
        className="absolute right-3 top-3.5 text-slate-400 hover:text-slate-600 transition-colors"
      >
        {visible ? <EyeOffIcon className="w-[18px] h-[18px]" /> : <EyeIcon className="w-[18px] h-[18px]" />}
      </button>
    </div>
  );
}
