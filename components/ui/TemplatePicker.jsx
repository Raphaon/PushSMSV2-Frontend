'use client';
import { useState, useEffect } from 'react';
import { BookOpen, Search, ChevronRight } from 'lucide-react';
import { templatesApi } from '@/lib/api';
import Modal from './Modal';

export default function TemplatePicker({ onSelect, buttonLabel = 'Choisir un modèle', className = '' }) {
  const [open, setOpen] = useState(false);
  const [templates, setTemplates] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    templatesApi.list({ limit: 100 })
      .then(r => setTemplates((r.data?.data || []).filter(t => t.is_active)))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [open]);

  const filtered = templates.filter(t =>
    !search || t.name.toLowerCase().includes(search.toLowerCase()) || t.body.toLowerCase().includes(search.toLowerCase())
  );

  const handleSelect = (t) => {
    onSelect(t);
    setOpen(false);
    setSearch('');
  };

  return (
    <>
      <button type="button" onClick={() => setOpen(true)}
        className={`flex items-center gap-1.5 text-xs text-red-600 hover:text-red-700 font-medium transition-colors ${className}`}>
        <BookOpen size={12} /> {buttonLabel}
      </button>

      <Modal open={open} onClose={() => { setOpen(false); setSearch(''); }} title="Choisir un modèle SMS">
        <div className="space-y-3">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Rechercher un modèle..."
              className="w-full pl-9 pr-4 py-2.5 text-sm bg-white border border-gray-200 rounded-xl outline-none
                focus:border-red-300 focus:ring-2 focus:ring-red-100" />
          </div>

          {loading ? (
            <div className="flex justify-center py-8">
              <svg className="animate-spin w-6 h-6 text-red-600" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="30 70" />
              </svg>
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-sm text-gray-400">
                {templates.length === 0 ? 'Aucun modèle disponible' : 'Aucun résultat'}
              </p>
            </div>
          ) : (
            <div className="max-h-72 overflow-y-auto space-y-1.5">
              {filtered.map(t => (
                <button key={t.id} onClick={() => handleSelect(t)}
                  className="w-full text-left px-4 py-3 rounded-xl border border-gray-100
                    hover:border-red-200 hover:bg-red-50/50 transition-all group flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-800 group-hover:text-red-700">{t.name}</p>
                    <p className="text-xs text-gray-500 mt-0.5 line-clamp-2 font-mono">{t.body}</p>
                    {t.category && (
                      <span className="text-[10px] text-gray-400 mt-1 inline-block bg-gray-100 px-1.5 py-0.5 rounded">
                        {t.category}
                      </span>
                    )}
                  </div>
                  <ChevronRight size={14} className="text-gray-300 group-hover:text-red-400 shrink-0 mt-1" />
                </button>
              ))}
            </div>
          )}
        </div>
      </Modal>
    </>
  );
}
