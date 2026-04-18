'use client';
import { Loader2 } from 'lucide-react';

const variants = {
  primary: 'bg-red-600 hover:bg-red-700 text-white shadow-sm',
  outline: 'border border-gray-200 hover:border-red-300 hover:bg-red-50 text-gray-700 hover:text-red-600',
  ghost: 'hover:bg-gray-100 text-gray-600',
  danger: 'bg-red-50 hover:bg-red-100 text-red-600',
  success: 'bg-green-600 hover:bg-green-700 text-white shadow-sm',
};

const sizes = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-4 py-2.5 text-sm',
  lg: 'px-5 py-3 text-base',
};

export default function Button({
  children, variant = 'primary', size = 'md',
  loading = false, disabled = false, className = '', ...props
}) {
  return (
    <button
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center gap-2 font-semibold rounded-xl
        transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed
        ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {loading ? <Loader2 size={14} className="animate-spin" /> : null}
      {children}
    </button>
  );
}
