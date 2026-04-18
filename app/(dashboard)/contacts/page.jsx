'use client';
import { useState, useEffect, useCallback, useRef } from 'react';
import { Plus, Search, Users, Edit2, Trash2, Upload, CheckCircle } from 'lucide-react';
import { contactsApi, getErrMsg } from '@/lib/api';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import Pagination from '@/components/ui/Pagination';
import EmptyState from '@/components/ui/EmptyState';
import Input from '@/components/ui/Input';
import { fmtDateTime } from '@/lib/utils';
import toast from 'react-hot-toast';

const emptyForm = { firstName: '', lastName: '', phone: '', email: '' };

export default function ContactsPage() {
  const [contacts, setContacts] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [statusFilter, setStatusFilter] = useState('active');
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState(null);
  const fileInputRef = useRef(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await contactsApi.list({ page, limit: 20, search: search || undefined, status: statusFilter || undefined });
      setContacts(data.data || []);
      setPagination(data.pagination);
    } catch { /* */ }
    setLoading(false);
  }, [page, search, statusFilter]);

  useEffect(() => { load(); }, [load]);

  const openCreate = () => { setEditing(null); setForm(emptyForm); setShowModal(true); };
  const openEdit = (c) => {
    setEditing(c);
    // phone_number is the DB column name
    setForm({ firstName: c.first_name || '', lastName: c.last_name || '', phone: c.phone_number || '', email: c.email || '' });
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editing) {
        // Update: only send editable fields (phone cannot be updated)
        await contactsApi.update(editing.id, {
          firstName: form.firstName,
          lastName: form.lastName,
          email: form.email,
        });
        toast.success('Contact mis à jour');
      } else {
        // Create: backend expects phoneNumber (camelCase)
        await contactsApi.create({
          firstName: form.firstName,
          lastName: form.lastName,
          phoneNumber: form.phone,
          email: form.email,
        });
        toast.success('Contact créé');
      }
      setShowModal(false);
      load();
    } catch (err) { toast.error(getErrMsg(err)); }
    setSaving(false);
  };

  const handleDelete = async (id) => {
    if (!confirm('Supprimer ce contact ?')) return;
    try {
      await contactsApi.delete(id);
      toast.success('Contact supprimé');
      load();
    } catch (err) { toast.error(getErrMsg(err)); }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setSearch(searchInput);
    setPage(1);
  };

  const handleImport = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImporting(true);
    setImportResult(null);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const { data } = await contactsApi.import(fd);
      setImportResult(data.data);
      toast.success(`Import : ${data.data.created} créé(s)`);
      load();
    } catch (err) {
      toast.error(getErrMsg(err));
    }
    setImporting(false);
    e.target.value = '';
  };

  return (
    <div className="space-y-5 animate-fadeIn">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <form onSubmit={handleSearch} className="flex items-center gap-2">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input value={searchInput} onChange={e => setSearchInput(e.target.value)}
              placeholder="Rechercher..."
              className="pl-9 pr-4 py-2 text-sm bg-white border border-gray-200 rounded-xl outline-none focus:border-red-300 focus:ring-2 focus:ring-red-100 w-56" />
          </div>
          <Button type="submit" variant="outline" size="sm">Chercher</Button>
        </form>
        <div className="flex items-center gap-2 flex-wrap">
          <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
            className="text-sm bg-white border border-gray-200 rounded-xl px-3 py-2 outline-none focus:border-red-300 text-gray-600">
            <option value="">Tous</option>
            <option value="active">Actifs</option>
            <option value="archived">Archivés</option>
          </select>
          <input ref={fileInputRef} type="file" accept=".xlsx,.xls,.csv" className="hidden" onChange={handleImport} />
          <Button variant="outline" onClick={() => fileInputRef.current?.click()} loading={importing}>
            <Upload size={14} /> Importer
          </Button>
          <a href="http://localhost:4000/static/samples/contacts-sample.csv" download
            className="flex items-center gap-1.5 px-3 py-2 text-xs text-gray-500 hover:text-gray-700 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
            <CheckCircle size={12} /> Modèle CSV
          </a>
          <Button onClick={openCreate}><Plus size={15} /> Nouveau contact</Button>
        </div>
      </div>

      {importResult && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-3">
          <CheckCircle size={16} className="text-green-600 shrink-0" />
          <p className="text-sm text-green-800">
            Import terminé — <strong>{importResult.created}</strong> créé(s), <strong>{importResult.skipped}</strong> ignoré(s)
            {importResult.errors?.length > 0 && ` · ${importResult.errors.length} erreur(s)`}
          </p>
          <button onClick={() => setImportResult(null)} className="ml-auto text-green-600 hover:text-green-800 text-lg leading-none">×</button>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-16">
            <svg className="animate-spin w-7 h-7 text-red-600" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="30 70" />
            </svg>
          </div>
        ) : contacts.length === 0 ? (
          <EmptyState icon={Users} title="Aucun contact"
            description="Ajoutez vos premiers contacts pour commencer."
            action={<Button onClick={openCreate}><Plus size={14} /> Ajouter un contact</Button>} />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/50">
                    <th className="text-xs font-semibold text-gray-500 px-5 py-3 text-left">Contact</th>
                    <th className="text-xs font-semibold text-gray-500 px-5 py-3 text-left">Téléphone</th>
                    <th className="text-xs font-semibold text-gray-500 px-5 py-3 text-left hidden md:table-cell">Email</th>
                    <th className="text-xs font-semibold text-gray-500 px-5 py-3 text-left hidden lg:table-cell">Créé le</th>
                    <th className="text-xs font-semibold text-gray-500 px-5 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {contacts.map(c => (
                    <tr key={c.id} className="border-b border-gray-50 hover:bg-gray-50/30 transition-colors">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center text-xs font-bold text-red-600">
                            {(c.first_name?.[0] || c.phone_number?.[0] || '?').toUpperCase()}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-gray-800">
                              {[c.first_name, c.last_name].filter(Boolean).join(' ') || '—'}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-sm text-gray-700">{c.phone_number}</td>
                      <td className="px-5 py-3.5 hidden md:table-cell text-sm text-gray-500">{c.email || '—'}</td>
                      <td className="px-5 py-3.5 hidden lg:table-cell text-xs text-gray-400">{fmtDateTime(c.created_at)}</td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center justify-end gap-1">
                          <button onClick={() => openEdit(c)}
                            className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors">
                            <Edit2 size={13} />
                          </button>
                          <button onClick={() => handleDelete(c.id)}
                            className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors">
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination pagination={pagination} onPage={setPage} />
          </>
        )}
      </div>

      <Modal open={showModal} onClose={() => setShowModal(false)}
        title={editing ? 'Modifier le contact' : 'Nouveau contact'}>
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input label="Prénom" placeholder="Jean"
              value={form.firstName} onChange={e => setForm(f => ({ ...f, firstName: e.target.value }))} />
            <Input label="Nom" placeholder="Dupont"
              value={form.lastName} onChange={e => setForm(f => ({ ...f, lastName: e.target.value }))} />
          </div>
          {!editing && (
            <Input label="Téléphone *" placeholder="+237600000000" required
              value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
          )}
          {editing && (
            <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-500">
              Téléphone : <span className="font-medium text-gray-700">{editing.phone_number}</span>
              <span className="text-xs ml-2 text-gray-400">(non modifiable)</span>
            </div>
          )}
          <Input label="Email" type="email" placeholder="jean@exemple.com"
            value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" type="button" onClick={() => setShowModal(false)}>Annuler</Button>
            <Button type="submit" loading={saving}>{editing ? 'Mettre à jour' : 'Créer'}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
