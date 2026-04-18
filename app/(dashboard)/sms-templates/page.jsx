'use client';
import { useState, useEffect, useCallback } from 'react';
import { Plus, FileText, Edit2, Trash2, Eye } from 'lucide-react';
import { templatesApi, getErrMsg } from '@/lib/api';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import Pagination from '@/components/ui/Pagination';
import EmptyState from '@/components/ui/EmptyState';
import Input, { Textarea } from '@/components/ui/Input';
import { fmtDateTime } from '@/lib/utils';
import toast from 'react-hot-toast';

const emptyForm = { name: '', body: '', category: 'MARKETING' };

export default function SmsTemplatesPage() {
  const [templates, setTemplates] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  // Preview
  const [previewTemplate, setPreviewTemplate] = useState(null);
  const [previewVars, setPreviewVars] = useState('{}');
  const [previewResult, setPreviewResult] = useState(null);
  const [previewing, setPreviewing] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await templatesApi.list({ page, limit: 15 });
      setTemplates(data.data || []);
      setPagination(data.pagination);
    } catch { /* */ }
    setLoading(false);
  }, [page]);

  useEffect(() => { load(); }, [load]);

  const openCreate = () => { setEditing(null); setForm(emptyForm); setShowModal(true); };
  const openEdit = (t) => { setEditing(t); setForm({ name: t.name, body: t.body, category: t.category || 'MARKETING' }); setShowModal(true); };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editing) {
        await templatesApi.update(editing.id, form);
        toast.success('Template mis à jour');
      } else {
        await templatesApi.create(form);
        toast.success('Template créé');
      }
      setShowModal(false);
      load();
    } catch (err) { toast.error(getErrMsg(err)); }
    setSaving(false);
  };

  const handleDelete = async (id) => {
    if (!confirm('Supprimer ce template ?')) return;
    try {
      await templatesApi.delete(id);
      toast.success('Template supprimé');
      load();
    } catch (err) { toast.error(getErrMsg(err)); }
  };

  const openPreview = (t) => { setPreviewTemplate(t); setPreviewVars('{}'); setPreviewResult(null); };

  const handlePreview = async (e) => {
    e.preventDefault();
    setPreviewing(true);
    try {
      let vars = {};
      try { vars = JSON.parse(previewVars); } catch { toast.error('JSON invalide'); setPreviewing(false); return; }
      const { data } = await templatesApi.preview(previewTemplate.id, { variables: vars });
      setPreviewResult(data.data?.rendered || data.data?.body || '');
    } catch (err) { toast.error(getErrMsg(err)); }
    setPreviewing(false);
  };

  const charCount = form.body?.length || 0;
  const smsCount = charCount <= 160 ? 1 : Math.ceil(charCount / 153);

  return (
    <div className="space-y-5 animate-fadeIn">
      <div className="flex items-center justify-between">
        <div />
        <Button onClick={openCreate}><Plus size={15} /> Nouveau template</Button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-16">
            <svg className="animate-spin w-7 h-7 text-red-600" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="30 70" />
            </svg>
          </div>
        ) : templates.length === 0 ? (
          <EmptyState icon={FileText} title="Aucun template"
            description="Créez des templates réutilisables avec des variables dynamiques."
            action={<Button onClick={openCreate}><Plus size={14} /> Créer</Button>} />
        ) : (
          <>
            <div className="divide-y divide-gray-50">
              {templates.map(t => (
                <div key={t.id} className="px-5 py-4 hover:bg-gray-50/30 transition-colors">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-sm font-semibold text-gray-800">{t.name}</p>
                        <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">{t.category}</span>
                      </div>
                      <p className="text-xs text-gray-500 line-clamp-2">{t.body}</p>
                      <p className="text-xs text-gray-400 mt-1.5">{fmtDateTime(t.created_at)}</p>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <button onClick={() => openPreview(t)}
                        className="p-1.5 rounded-lg hover:bg-blue-50 text-gray-400 hover:text-blue-500 transition-colors">
                        <Eye size={13} />
                      </button>
                      <button onClick={() => openEdit(t)}
                        className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors">
                        <Edit2 size={13} />
                      </button>
                      <button onClick={() => handleDelete(t.id)}
                        className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors">
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <Pagination pagination={pagination} onPage={setPage} />
          </>
        )}
      </div>

      {/* Create/Edit modal */}
      <Modal open={showModal} onClose={() => setShowModal(false)}
        title={editing ? 'Modifier le template' : 'Nouveau template'} size="lg">
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input label="Nom *" placeholder="Promo SMS" required
              value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Catégorie</label>
              <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                className="w-full text-sm bg-white border border-gray-200 rounded-xl px-3 py-2.5 outline-none focus:border-red-300 focus:ring-2 focus:ring-red-100">
                <option value="MARKETING">Marketing</option>
                <option value="TRANSACTIONAL">Transactionnel</option>
                <option value="OTP">OTP</option>
              </select>
            </div>
          </div>
          <Textarea label="Corps du message *" placeholder="Bonjour {{name}}, votre code est {{code}}..."
            rows={5} required value={form.body}
            onChange={e => setForm(f => ({ ...f, body: e.target.value }))} />
          <div className="flex justify-between text-xs text-gray-400 -mt-2">
            <span>Utilisez {'{{variable}}'} pour les champs dynamiques</span>
            <span>{charCount} car. · {smsCount} SMS</span>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" type="button" onClick={() => setShowModal(false)}>Annuler</Button>
            <Button type="submit" loading={saving}>{editing ? 'Mettre à jour' : 'Créer'}</Button>
          </div>
        </form>
      </Modal>

      {/* Preview modal */}
      <Modal open={!!previewTemplate} onClose={() => setPreviewTemplate(null)} title="Prévisualiser le template">
        {previewTemplate && (
          <form onSubmit={handlePreview} className="space-y-4">
            <div className="bg-gray-50 rounded-xl p-4 text-sm text-gray-700 whitespace-pre-wrap">
              {previewTemplate.body}
            </div>
            <Textarea label="Variables (JSON)" placeholder='{"name": "Jean", "code": "1234"}'
              rows={3} value={previewVars} onChange={e => setPreviewVars(e.target.value)} />
            <Button type="submit" loading={previewing} variant="outline" className="w-full">
              <Eye size={14} /> Prévisualiser
            </Button>
            {previewResult && (
              <div>
                <p className="text-xs font-medium text-gray-500 mb-2">Résultat :</p>
                <div className="bg-white border-2 border-red-100 rounded-xl p-4 text-sm text-gray-800 whitespace-pre-wrap">
                  {previewResult}
                </div>
              </div>
            )}
          </form>
        )}
      </Modal>
    </div>
  );
}
