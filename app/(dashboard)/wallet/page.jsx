'use client';
import { useState, useEffect, useCallback } from 'react';
import { MessageSquare, TrendingUp, TrendingDown, ArrowUpCircle, Clock, RefreshCw, Plus, Send } from 'lucide-react';
import { walletApi, rechargeApi, getErrMsg } from '@/lib/api';
import { isSuperAdmin } from '@/lib/auth';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Modal from '@/components/ui/Modal';
import Pagination from '@/components/ui/Pagination';
import Input from '@/components/ui/Input';
import { fmtCredits, fmtDateTime, RECHARGE_STATUS_LABELS, RECHARGE_STATUS_COLORS, WALLET_TX_COLORS } from '@/lib/utils';
import toast from 'react-hot-toast';

const TX_ICONS = { CREDIT: TrendingUp, DEBIT: TrendingDown, RESERVE: Clock, RELEASE: RefreshCw, REFUND: ArrowUpCircle };
const TX_LABELS = { CREDIT: 'Crédit', DEBIT: 'Débit', RESERVE: 'Réservé', RELEASE: 'Libéré', REFUND: 'Remboursé' };
const TX_BG = { CREDIT: 'bg-green-50', DEBIT: 'bg-red-50', RESERVE: 'bg-orange-50', RELEASE: 'bg-blue-50', REFUND: 'bg-purple-50' };

const Spinner = () => (
  <div className="flex justify-center py-10">
    <svg className="animate-spin w-6 h-6 text-red-600" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="30 70" />
    </svg>
  </div>
);

export default function WalletPage() {
  const superAdmin = isSuperAdmin();
  const [wallet, setWallet] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [txPagination, setTxPagination] = useState(null);
  const [txPage, setTxPage] = useState(1);
  const [typeFilter, setTypeFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [txLoading, setTxLoading] = useState(false);

  // Recharge requests
  const [requests, setRequests] = useState([]);
  const [reqPagination, setReqPagination] = useState(null);
  const [reqPage, setReqPage] = useState(1);
  const [reqLoading, setReqLoading] = useState(false);
  const [showRechargeModal, setShowRechargeModal] = useState(false);
  const [rechargeForm, setRechargeForm] = useState({ creditsAmount: '', note: '' });
  const [submitting, setSubmitting] = useState(false);

  // Review modal (super admin)
  const [reviewing, setReviewing] = useState(null);
  const [reviewNote, setReviewNote] = useState('');
  const [reviewLoading, setReviewLoading] = useState(false);

  useEffect(() => {
    walletApi.get().then(r => setWallet(r.data.data)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const loadTx = useCallback(async () => {
    setTxLoading(true);
    try {
      const { data } = await walletApi.transactions({ page: txPage, limit: 20, type: typeFilter || undefined });
      setTransactions(data.data || []);
      setTxPagination(data.pagination);
    } catch { /* */ }
    setTxLoading(false);
  }, [txPage, typeFilter]);

  const loadRequests = useCallback(async () => {
    setReqLoading(true);
    try {
      const { data } = await rechargeApi.list({ page: reqPage, limit: 10 });
      setRequests(data.data || []);
      setReqPagination(data.pagination);
    } catch { /* */ }
    setReqLoading(false);
  }, [reqPage]);

  useEffect(() => { loadTx(); }, [loadTx]);
  useEffect(() => { loadRequests(); }, [loadRequests]);

  const handleRequestRecharge = async (e) => {
    e.preventDefault();
    const n = parseInt(rechargeForm.creditsAmount);
    if (!n || n <= 0) { toast.error('Entrez un nombre de crédits valide'); return; }
    setSubmitting(true);
    try {
      await rechargeApi.create({ creditsAmount: n, note: rechargeForm.note });
      toast.success('Demande envoyée ! En attente de validation.');
      setShowRechargeModal(false);
      setRechargeForm({ creditsAmount: '', note: '' });
      loadRequests();
    } catch (err) { toast.error(getErrMsg(err)); }
    setSubmitting(false);
  };

  const handleReview = async (action) => {
    setReviewLoading(true);
    try {
      await rechargeApi.review(reviewing.id, { action, adminNote: reviewNote });
      toast.success(action === 'approved' ? 'Recharge approuvée !' : 'Demande rejetée');
      setReviewing(null);
      setReviewNote('');
      loadRequests();
      // Refresh wallet for superadmin
      walletApi.get().then(r => setWallet(r.data.data)).catch(() => {});
    } catch (err) { toast.error(getErrMsg(err)); }
    setReviewLoading(false);
  };

  if (loading) return <Spinner />;

  const credits = wallet?.message_credits != null ? parseInt(wallet.message_credits) : null;
  const isLow = credits != null && credits < 20;

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Credits card */}
      <div className="grid sm:grid-cols-3 gap-4">
        <div className={`sm:col-span-2 rounded-2xl p-6 text-white ${isLow ? 'bg-gradient-to-br from-orange-500 to-red-600' : 'bg-gradient-to-br from-red-600 to-rose-700'}`}>
          <div className="flex items-center gap-2 mb-4 opacity-80">
            <MessageSquare size={16} />
            <span className="text-sm font-medium">Crédits de messages</span>
          </div>
          <p className="text-4xl font-bold tracking-tight">
            {credits != null ? credits.toLocaleString('fr-FR') : '—'}
          </p>
          <p className="text-sm opacity-70 mt-1">
            {wallet?.reserved_credits ? `${wallet.reserved_credits} réservé(s)` : 'Aucun réservé'}
          </p>
          {isLow && <p className="text-xs bg-white/20 rounded-lg px-3 py-1.5 mt-3 inline-block">⚠ Crédits faibles</p>}
          <div className="mt-5">
            <Button onClick={() => setShowRechargeModal(true)}
              className="bg-white/20 hover:bg-white/30 text-white border-0 backdrop-blur-sm">
              <Plus size={14} /> Demander une recharge
            </Button>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col justify-between">
          <p className="text-sm text-gray-500 font-medium">Dernière recharge</p>
          <div>
            <p className="text-2xl font-bold text-gray-800 mt-2">
              {wallet?.last_credit_amount ? `${wallet.last_credit_amount.toLocaleString('fr-FR')} cr.` : '—'}
            </p>
            <p className="text-xs text-gray-400 mt-1">{wallet?.last_credits_at ? fmtDateTime(wallet.last_credits_at) : 'Jamais rechargé'}</p>
          </div>
        </div>
      </div>

      {/* Recharge requests */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h2 className="text-sm font-semibold text-gray-700">
            {superAdmin ? 'Toutes les demandes de recharge' : 'Mes demandes de recharge'}
          </h2>
        </div>
        {reqLoading ? <Spinner /> : requests.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-10">Aucune demande</p>
        ) : (
          <>
            <div className="divide-y divide-gray-50">
              {requests.map(r => (
                <div key={r.id} className="flex items-center justify-between px-5 py-3.5 hover:bg-gray-50/30 transition-colors">
                  <div>
                    {superAdmin && <p className="text-xs font-semibold text-gray-500 mb-0.5">{r.tenant_name}</p>}
                    <p className="text-sm font-medium text-gray-800">{r.credits_amount?.toLocaleString('fr-FR')} crédits</p>
                    {r.note && <p className="text-xs text-gray-500 mt-0.5">Note : {r.note}</p>}
                    {r.admin_note && <p className="text-xs text-orange-600 mt-0.5">Admin : {r.admin_note}</p>}
                    <p className="text-xs text-gray-400 mt-0.5">{fmtDateTime(r.created_at)}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${RECHARGE_STATUS_COLORS[r.status]}`}>
                      {RECHARGE_STATUS_LABELS[r.status]}
                    </span>
                    {superAdmin && r.status === 'pending' && (
                      <button onClick={() => { setReviewing(r); setReviewNote(''); }}
                        className="text-xs text-red-600 hover:text-red-700 font-medium px-2.5 py-1 border border-red-200 rounded-lg hover:bg-red-50 transition-colors">
                        Traiter
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <Pagination pagination={reqPagination} onPage={setReqPage} />
          </>
        )}
      </div>

      {/* Transactions */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h2 className="text-sm font-semibold text-gray-700">Historique</h2>
          <select value={typeFilter} onChange={e => { setTypeFilter(e.target.value); setTxPage(1); }}
            className="text-xs bg-white border border-gray-200 rounded-lg px-2.5 py-1.5 outline-none focus:border-red-300">
            <option value="">Tout</option>
            {Object.entries(TX_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
        </div>
        {txLoading ? <Spinner /> : transactions.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-10">Aucune transaction</p>
        ) : (
          <>
            <div className="divide-y divide-gray-50">
              {transactions.map(tx => {
                const Icon = TX_ICONS[tx.type] || Send;
                return (
                  <div key={tx.id} className="flex items-center justify-between px-5 py-3.5 hover:bg-gray-50/30 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-xl ${TX_BG[tx.type] || 'bg-gray-50'} flex items-center justify-center`}>
                        <Icon size={15} className={WALLET_TX_COLORS[tx.type] || 'text-gray-500'} />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-800">{tx.description || TX_LABELS[tx.type] || tx.type}</p>
                        <p className="text-xs text-gray-400">{fmtDateTime(tx.created_at)}</p>
                      </div>
                    </div>
                    <p className={`text-sm font-bold ${WALLET_TX_COLORS[tx.type] || 'text-gray-700'}`}>
                      {['DEBIT', 'RESERVE'].includes(tx.type) ? '-' : '+'}{Math.round(tx.amount).toLocaleString('fr-FR')}
                    </p>
                  </div>
                );
              })}
            </div>
            <Pagination pagination={txPagination} onPage={setTxPage} />
          </>
        )}
      </div>

      {/* Recharge request modal */}
      <Modal open={showRechargeModal} onClose={() => setShowRechargeModal(false)} title="Demander des crédits">
        <form onSubmit={handleRequestRecharge} className="space-y-4">
          <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-sm text-blue-800">
            <p className="font-semibold mb-1">Comment ça fonctionne ?</p>
            <p>Entrez le nombre de crédits souhaités. Chaque crédit = 1 SMS envoyé. Votre demande sera validée manuellement par notre équipe.</p>
          </div>
          <Input label="Nombre de crédits *" type="number" placeholder="100" min="1" required
            value={rechargeForm.creditsAmount}
            onChange={e => setRechargeForm(f => ({ ...f, creditsAmount: e.target.value }))} />
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Note (optionnel)</label>
            <textarea value={rechargeForm.note} onChange={e => setRechargeForm(f => ({ ...f, note: e.target.value }))}
              placeholder="Motif ou informations supplémentaires..."
              rows={3}
              className="w-full px-3 py-2.5 text-sm bg-white border border-gray-200 rounded-xl outline-none focus:border-red-300 focus:ring-2 focus:ring-red-100 resize-none" />
          </div>
          <div className="flex justify-end gap-3 pt-1">
            <Button variant="outline" type="button" onClick={() => setShowRechargeModal(false)}>Annuler</Button>
            <Button type="submit" loading={submitting}>Envoyer la demande</Button>
          </div>
        </form>
      </Modal>

      {/* Review modal (SUPERADMIN) */}
      <Modal open={!!reviewing} onClose={() => setReviewing(null)} title="Traiter la demande de recharge">
        {reviewing && (
          <div className="space-y-4">
            <div className="bg-gray-50 rounded-xl p-4 text-sm text-gray-700 space-y-1">
              <p><strong>Tenant :</strong> {reviewing.tenant_name}</p>
              <p><strong>Demandeur :</strong> {reviewing.requester_email}</p>
              <p><strong>Crédits demandés :</strong> {reviewing.credits_amount?.toLocaleString('fr-FR')}</p>
              {reviewing.note && <p><strong>Note :</strong> {reviewing.note}</p>}
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Note admin (optionnel)</label>
              <textarea value={reviewNote} onChange={e => setReviewNote(e.target.value)}
                placeholder="Raison du rejet ou commentaire..."
                rows={2}
                className="w-full px-3 py-2.5 text-sm bg-white border border-gray-200 rounded-xl outline-none focus:border-red-300 focus:ring-2 focus:ring-red-100 resize-none" />
            </div>
            <div className="flex justify-end gap-3 pt-1">
              <Button variant="outline" type="button" onClick={() => setReviewing(null)}>Annuler</Button>
              <button onClick={() => handleReview('rejected')} disabled={reviewLoading}
                className="px-4 py-2 text-sm font-semibold text-red-600 border border-red-200 rounded-xl hover:bg-red-50 transition-colors disabled:opacity-50">
                Rejeter
              </button>
              <Button onClick={() => handleReview('approved')} loading={reviewLoading}>
                Approuver
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
