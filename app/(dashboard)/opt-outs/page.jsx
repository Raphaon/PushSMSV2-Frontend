'use client';
import { useState, useEffect, useCallback } from 'react';
import { Plus, UserX, Search, Trash2 } from 'lucide-react';
import { optOutsApi, getErrMsg } from '@/lib/api';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import Pagination from '@/components/ui/Pagination';
import EmptyState from '@/components/ui/EmptyState';
import Input from '@/components/ui/Input';
import { fmtDateTime } from '@/lib/utils';
import toast from 'react-hot-toast';

export default function OptOutsPage() {
  const [optOuts, setOptOuts] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ phone: '', reason: '' });
  const [saving, setSaving] = useState(false);

  // Check
  const [checkPhone, setCheckPhone] = useState('');
  const [checkResult, setCheckResult] = useState(null);
  const [checking, setChecking] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await optOutsApi.list({ page, limit: 20 });
      setOptOuts(data.data || []);
      setPagination(data.pagination);
    } catch { /* */ }
    setLoading(false);
  }, [page]);

  useEffect(() => { load(); }, [load]);

  const handleAdd = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await optOutsApi.create(form);
      toast.success('Numéro ajouté à la liste de désabonnement');
      setShowModal(false);
      setForm({ phone: '', reason: '' });
      load();
    } catch (err) { toast.error(getErrMsg(err)); }
    setSaving(false);
  };

  const handleRemove = async (phone) => {
    if (!confirm(`Réactiver les envois vers ${phone} ?`)) return;
    try {
      await optOutsApi.remove({ phone });
      toast.success('Contact réactivé');
      load();
    } catch (err) { toast.error(getErrMsg(err)); }
  };

  const handleCheck = async (e) => {
    e.preventDefault();
    setChecking(true);
    setCheckResult(null);
    try {
      const { data } = await optOutsApi.check(checkPhone);
      setCheckResult(data.data);
    } catch (err) { toast.error(getErrMsg(err)); }
    setChecking(false);
  };

  return (
    <div className="space-y-5 animate-fadeIn">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Check tool */}
        <form onSubmit={handleCheck} className="flex items-center gap-2">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input value={checkPhone} onChange={e => { setCheckPhone(e.target.value); setCheckResult(null); }}
              placeholder="Vérifier un numéro..."
              className="pl-9 pr-4 py-2 text-sm bg-white border border-gray-200 rounded-xl outline-none focus:border-red-300 focus:ring-2 focus:ring-red-100 w-60" />
          </div>
          <Button type="submit" variant="outline" size="sm" loading={checking}>Vérifier</Button>
          {checkResult !== null && (
            <span className={`text-xs font-semibold px-3 py-1.5 rounded-full ${checkResult?.opted_out ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
              {checkResult?.opted_out ? 'Désabonné' : 'Actif'}
            </span>
          )}
        </form>
        <Button onClick={() => setShowModal(true)}><Plus size={15} /> Ajouter un désabonnement</Button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-16">
            <svg className="animate-spin w-7 h-7 text-red-600" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="30 70" />
            </svg>
          </div>
        ) : optOuts.length === 0 ? (
          <EmptyState icon={UserX} title="Aucun désabonnement"
            description="Les numéros désabonnés ne recevront plus vos SMS." />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/50">
                    <th className="text-xs font-semibold text-gray-500 px-5 py-3 text-left">Téléphone</th>
                    <th className="text-xs font-semibold text-gray-500 px-5 py-3 text-left hidden md:table-cell">Raison</th>
                    <th className="text-xs font-semibold text-gray-500 px-5 py-3 text-left hidden lg:table-cell">Date</th>
                    <th className="text-xs font-semibold text-gray-500 px-5 py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {optOuts.map((o, i) => (
                    <tr key={o.phone || i} className="border-b border-gray-50 hover:bg-gray-50/30 transition-colors">
                      <td className="px-5 py-3.5 text-sm font-semibold text-gray-800">{o.phone}</td>
                      <td className="px-5 py-3.5 hidden md:table-cell text-sm text-gray-500">{o.reason || '—'}</td>
                      <td className="px-5 py-3.5 hidden lg:table-cell text-xs text-gray-400">{fmtDateTime(o.created_at)}</td>
                      <td className="px-5 py-3.5 text-right">
                        <button onClick={() => handleRemove(o.phone)}
                          className="text-xs text-red-500 hover:text-red-700 font-medium flex items-center gap-1 ml-auto transition-colors">
                          <Trash2 size={12} /> Réactiver
                        </button>
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

      <Modal open={showModal} onClose={() => setShowModal(false)} title="Ajouter un désabonnement">
        <form onSubmit={handleAdd} className="space-y-4">
          <Input label="Numéro de téléphone *" placeholder="+237600000000" required
            value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
          <Input label="Raison (optionnel)" placeholder="Demande du client"
            value={form.reason} onChange={e => setForm(f => ({ ...f, reason: e.target.value }))} />
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" type="button" onClick={() => setShowModal(false)}>Annuler</Button>
            <Button type="submit" loading={saving}>Ajouter</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
