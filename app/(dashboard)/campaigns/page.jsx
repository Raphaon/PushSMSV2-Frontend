'use client';
import { useState, useEffect, useCallback } from 'react';
import { Plus, Search, Send, X, Megaphone, ChevronDown } from 'lucide-react';
import Link from 'next/link';
import { campaignsApi, senderIdsApi, contactListsApi, getErrMsg } from '@/lib/api';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Modal from '@/components/ui/Modal';
import Pagination from '@/components/ui/Pagination';
import EmptyState from '@/components/ui/EmptyState';
import Input, { Select, Textarea } from '@/components/ui/Input';
import { fmtDateTime, fmtNumber, CAMPAIGN_STATUS_COLORS, CAMPAIGN_STATUS_LABELS } from '@/lib/utils';
import TemplatePicker from '@/components/ui/TemplatePicker';
import toast from 'react-hot-toast';

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [launching, setLaunching] = useState(null);

  // Senders + lists for create form
  const [senders, setSenders] = useState([]);
  const [lists, setLists] = useState([]);
  const [form, setForm] = useState({ name: '', messageBody: '', type: 'MARKETING', senderIdId: '', contactListId: '' });
  const [creating, setCreating] = useState(false);

  const loadCampaigns = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await campaignsApi.list({ page, limit: 15, status: statusFilter || undefined });
      setCampaigns(data.data || []);
      setPagination(data.pagination);
    } catch { /* */ }
    setLoading(false);
  }, [page, statusFilter]);

  useEffect(() => { loadCampaigns(); }, [loadCampaigns]);

  const openCreate = async () => {
    const [s, l] = await Promise.all([senderIdsApi.list(), contactListsApi.list({ limit: 100 })]);
    setSenders((s.data.data || []).filter(x => x.status === 'active'));
    setLists(l.data.data || []);
    setShowCreate(true);
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setCreating(true);
    try {
      await campaignsApi.create(form);
      toast.success('Campagne créée');
      setShowCreate(false);
      setForm({ name: '', messageBody: '', type: 'MARKETING', senderIdId: '', contactListId: '' });
      loadCampaigns();
    } catch (err) { toast.error(getErrMsg(err)); }
    setCreating(false);
  };

  const handleLaunch = async (id) => {
    if (!confirm('Lancer cette campagne maintenant ? Les crédits seront débités.')) return;
    setLaunching(id);
    try {
      await campaignsApi.launch(id);
      toast.success('Campagne lancée avec succès !');
      loadCampaigns();
    } catch (err) { toast.error(getErrMsg(err)); }
    setLaunching(null);
  };

  const handleCancel = async (id) => {
    if (!confirm('Annuler cette campagne ?')) return;
    try {
      await campaignsApi.cancel(id);
      toast.success('Campagne annulée');
      loadCampaigns();
    } catch (err) { toast.error(getErrMsg(err)); }
  };

  return (
    <div className="space-y-5 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
            className="text-sm bg-white border border-gray-200 rounded-xl px-3 py-2 outline-none
              focus:border-red-300 focus:ring-2 focus:ring-red-100 text-gray-700">
            <option value="">Tous les statuts</option>
            {Object.entries(CAMPAIGN_STATUS_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
        </div>
        <Button onClick={openCreate}>
          <Plus size={15} /> Nouvelle campagne
        </Button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-16">
            <svg className="animate-spin w-7 h-7 text-red-600" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="30 70" />
            </svg>
          </div>
        ) : campaigns.length === 0 ? (
          <EmptyState icon={Megaphone} title="Aucune campagne"
            description="Créez votre première campagne pour commencer à envoyer des SMS."
            action={<Button onClick={openCreate}><Plus size={14} /> Créer une campagne</Button>} />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/50">
                    <th className="text-xs font-semibold text-gray-500 px-5 py-3 text-left">Campagne</th>
                    <th className="text-xs font-semibold text-gray-500 px-5 py-3 text-left">Statut</th>
                    <th className="text-xs font-semibold text-gray-500 px-5 py-3 text-left hidden sm:table-cell">Destinataires</th>
                    <th className="text-xs font-semibold text-gray-500 px-5 py-3 text-left hidden md:table-cell">Crédits utilisés</th>
                    <th className="text-xs font-semibold text-gray-500 px-5 py-3 text-left hidden lg:table-cell">Créée le</th>
                    <th className="text-xs font-semibold text-gray-500 px-5 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {campaigns.map(c => (
                    <tr key={c.id} className="border-b border-gray-50 hover:bg-gray-50/30 transition-colors">
                      <td className="px-5 py-3.5">
                        <p className="text-sm font-semibold text-gray-800">{c.name}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{c.type}</p>
                      </td>
                      <td className="px-5 py-3.5">
                        <Badge className={CAMPAIGN_STATUS_COLORS[c.status]}>
                          {CAMPAIGN_STATUS_LABELS[c.status]}
                        </Badge>
                      </td>
                      <td className="px-5 py-3.5 hidden sm:table-cell">
                        <div className="text-sm text-gray-700">
                          <span className="font-semibold text-green-600">{fmtNumber(c.sent_count)}</span>
                          <span className="text-gray-400"> / {fmtNumber(c.target_count)}</span>
                        </div>
                        {c.target_count > 0 && (
                          <div className="w-20 h-1 bg-gray-200 rounded mt-1">
                            <div className="h-1 bg-green-500 rounded"
                              style={{ width: `${Math.min(100, (c.sent_count / c.target_count) * 100)}%` }} />
                          </div>
                        )}
                      </td>
                      <td className="px-5 py-3.5 hidden md:table-cell text-sm text-gray-700">
                        {fmtNumber(c.actual_cost)}
                      </td>
                      <td className="px-5 py-3.5 hidden lg:table-cell text-xs text-gray-500">
                        {fmtDateTime(c.created_at)}
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center justify-end gap-2">
                          {['DRAFT', 'SCHEDULED'].includes(c.status) && (
                            <Button size="sm" variant="success"
                              loading={launching === c.id} onClick={() => handleLaunch(c.id)}>
                              <Send size={12} /> Lancer
                            </Button>
                          )}
                          {['DRAFT', 'SCHEDULED'].includes(c.status) && (
                            <Button size="sm" variant="danger" onClick={() => handleCancel(c.id)}>
                              <X size={12} />
                            </Button>
                          )}
                          <Link href={`/campaigns/${c.id}`}
                            className="text-xs text-red-600 hover:text-red-700 font-medium px-2">
                            Détail →
                          </Link>
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

      {/* Modal création */}
      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="Nouvelle campagne" size="lg">
        <form onSubmit={handleCreate} className="space-y-4">
          <Input label="Nom de la campagne" placeholder="Promo Ramadan 2026"
            value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
          <div className="grid grid-cols-2 gap-4">
            <Select label="Type" value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}>
              <option value="MARKETING">Marketing</option>
              <option value="TRANSACTIONAL">Transactionnel</option>
            </Select>
            <Select label="Sender ID *" value={form.senderIdId} required
              onChange={e => setForm(f => ({ ...f, senderIdId: e.target.value }))}>
              <option value="">Sélectionner...</option>
              {senders.map(s => <option key={s.id} value={s.id}>{s.value}</option>)}
            </Select>
          </div>
          <Select label="Liste de contacts" value={form.contactListId}
            onChange={e => setForm(f => ({ ...f, contactListId: e.target.value }))}>
            <option value="">Sélectionner une liste...</option>
            {lists.map(l => <option key={l.id} value={l.id}>{l.name} ({l.member_count} contacts)</option>)}
          </Select>
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-sm font-medium text-gray-700">Message SMS <span className="text-red-500">*</span></label>
              <TemplatePicker buttonLabel="Utiliser un modèle" onSelect={t => setForm(f => ({ ...f, messageBody: t.body }))} />
            </div>
            <Textarea placeholder="Bonjour ! Votre message ici..."
              rows={4} value={form.messageBody} required
              onChange={e => setForm(f => ({ ...f, messageBody: e.target.value }))} />
          </div>
          {form.messageBody && (
            <p className="text-xs text-gray-500 -mt-2">
              {form.messageBody.length} caractères
            </p>
          )}
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" type="button" onClick={() => setShowCreate(false)}>Annuler</Button>
            <Button type="submit" loading={creating}>Créer la campagne</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
