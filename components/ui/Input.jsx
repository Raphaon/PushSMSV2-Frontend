'use client';
export default function Input({ label, error, icon: Icon, className = '', ...props }) {
  return (
    <div className="w-full">
      {label && <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>}
      <div className="relative">
        {Icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            <Icon size={16} />
          </div>
        )}
        <input
          className={`w-full bg-gray-50 border rounded-xl px-4 py-2.5 text-sm text-gray-900
            placeholder-gray-400 outline-none transition-all
            focus:border-red-400 focus:ring-2 focus:ring-red-100
            ${error ? 'border-red-300 bg-red-50' : 'border-gray-200'}
            ${Icon ? 'pl-9' : ''}
            ${className}`}
          {...props}
        />
      </div>
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}

export function Textarea({ label, error, className = '', ...props }) {
  return (
    <div className="w-full">
      {label && <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>}
      <textarea
        className={`w-full bg-gray-50 border rounded-xl px-4 py-2.5 text-sm text-gray-900
          placeholder-gray-400 outline-none transition-all resize-none
          focus:border-red-400 focus:ring-2 focus:ring-red-100
          ${error ? 'border-red-300 bg-red-50' : 'border-gray-200'}
          ${className}`}
        {...props}
      />
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}

export function Select({ label, error, className = '', children, ...props }) {
  return (
    <div className="w-full">
      {label && <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>}
      <select
        className={`w-full bg-gray-50 border rounded-xl px-4 py-2.5 text-sm text-gray-900
          outline-none transition-all
          focus:border-red-400 focus:ring-2 focus:ring-red-100
          ${error ? 'border-red-300 bg-red-50' : 'border-gray-200'}
          ${className}`}
        {...props}
      >
        {children}
      </select>
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}
