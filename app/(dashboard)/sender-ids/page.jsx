'use client';
import { useState, useEffect } from 'react';
import { Plus, Tag, CheckCircle, XCircle } from 'lucide-react';
import { senderIdsApi, getErrMsg } from '@/lib/api';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Modal from '@/components/ui/Modal';
import EmptyState from '@/components/ui/EmptyState';
import Input from '@/components/ui/Input';
import { fmtDateTime } from '@/lib/utils';
import toast from 'react-hot-toast';

const STATUS_COLORS = {
  active: 'bg-green-100 text-green-700',
  inactive: 'bg-gray-100 text-gray-500',
  pending: 'bg-yellow-100 text-yellow-700',
};
const STATUS_LABELS = { active: 'Actif', inactive: 'Inactif', pending: 'En attente' };

export default function SenderIdsPage() {
  const [senders, setSenders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ value: '', type: 'ALPHANUMERIC' });
  const [creating, setCreating] = useState(false);
  const [toggling, setToggling] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await senderIdsApi.list();
      setSenders(data.data || []);
    } catch { /* */ }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setCreating(true);
    try {
      await senderIdsApi.create(form);
      toast.success('Sender ID créé');
      setShowModal(false);
      setForm({ value: '', type: 'ALPHANUMERIC' });
      load();
    } catch (err) { toast.error(getErrMsg(err)); }
    setCreating(false);
  };

  const handleToggle = async (s) => {
    setToggling(s.id);
    try {
      if (s.status === 'active') {
        await senderIdsApi.deactivate(s.id);
        toast.success('Sender ID désactivé');
      } else {
        await senderIdsApi.activate(s.id);
        toast.success('Sender ID activé');
      }
      load();
    } catch (err) { toast.error(getErrMsg(err)); }
    setToggling(null);
  };

  return (
    <div className="space-y-5 animate-fadeIn">
      <div className="flex items-center justify-between">
        <div />
        <Button onClick={() => setShowModal(true)}><Plus size={15} /> Nouveau Sender ID</Button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-16">
            <svg className="animate-spin w-7 h-7 text-red-600" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="30 70" />
            </svg>
          </div>
        ) : senders.length === 0 ? (
          <EmptyState icon={Tag} title="Aucun Sender ID"
            description="Créez un Sender ID pour personnaliser l'expéditeur de vos SMS."
            action={<Button onClick={() => setShowModal(true)}><Plus size={14} /> Créer</Button>} />
        ) : (
          <div className="divide-y divide-gray-50">
            {senders.map(s => (
              <div key={s.id} className="flex items-center justify-between px-5 py-4 hover:bg-gray-50/30 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center">
                    <Tag size={16} className="text-red-500" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-800">{s.value}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{s.type} · Créé le {fmtDateTime(s.created_at)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge className={STATUS_COLORS[s.status] || 'bg-gray-100 text-gray-500'}>
                    {STATUS_LABELS[s.status] || s.status}
                  </Badge>
                  <Button size="sm" variant="outline" loading={toggling === s.id}
                    onClick={() => handleToggle(s)}>
                    {s.status === 'active'
                      ? <><XCircle size={12} /> Désactiver</>
                      : <><CheckCircle size={12} /> Activer</>}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Modal open={showModal} onClose={() => setShowModal(false)} title="Nouveau Sender ID">
        <form onSubmit={handleCreate} className="space-y-4">
          <Input label="Valeur *" placeholder="MYCOMPANY" required
            value={form.value} onChange={e => setForm(f => ({ ...f, value: e.target.value }))} />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Type</label>
            <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}
              className="w-full text-sm bg-white border border-gray-200 rounded-xl px-3 py-2.5 outline-none focus:border-red-300 focus:ring-2 focus:ring-red-100">
              <option value="ALPHANUMERIC">Alphanumérique (ex: MYCOMPANY)</option>
              <option value="NUMERIC">Numérique (ex: +237600000000)</option>
              <option value="SHORTCODE">Code court (ex: 8080)</option>
            </select>
          </div>
          <p className="text-xs text-gray-500 bg-amber-50 border border-amber-100 rounded-xl px-3 py-2">
            Les Sender IDs alphanumériques nécessitent une validation avant utilisation.
          </p>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" type="button" onClick={() => setShowModal(false)}>Annuler</Button>
            <Button type="submit" loading={creating}>Créer</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
