'use client';
import { useState, useEffect, useCallback } from 'react';
import { RefreshCw, CheckCircle, XCircle, Clock } from 'lucide-react';
import { rechargeApi, getErrMsg } from '@/lib/api';
import { isSuperAdmin } from '@/lib/auth';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import Pagination from '@/components/ui/Pagination';
import { fmtDateTime, RECHARGE_STATUS_LABELS, RECHARGE_STATUS_COLORS } from '@/lib/utils';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';

export default function RechargeRequestsPage() {
  const router = useRouter();
  const [requests, setRequests] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('pending');
  const [loading, setLoading] = useState(true);
  const [reviewing, setReviewing] = useState(null);
  const [reviewNote, setReviewNote] = useState('');
  const [reviewLoading, setReviewLoading] = useState(false);

  useEffect(() => {
    if (!isSuperAdmin()) router.replace('/dashboard');
  }, [router]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await rechargeApi.list({ page, limit: 20, status: statusFilter || undefined });
      setRequests(data.data || []);
      setPagination(data.pagination);
    } catch { /* */ }
    setLoading(false);
  }, [page, statusFilter]);

  useEffect(() => { load(); }, [load]);

  const handleReview = async (action) => {
    setReviewLoading(true);
    try {
      await rechargeApi.review(reviewing.id, { action, adminNote: reviewNote });
      toast.success(action === 'approved' ? 'Recharge approuvée !' : 'Demande rejetée');
      setReviewing(null);
      setReviewNote('');
      load();
    } catch (err) {
      toast.error(getErrMsg(err));
    }
    setReviewLoading(false);
  };

  const STATUS_ICONS = { pending: Clock, approved: CheckCircle, rejected: XCircle };
  const STATUS_BG = { pending: 'bg-yellow-50', approved: 'bg-green-50', rejected: 'bg-red-50' };
  const STATUS_ICON_COLORS = { pending: 'text-yellow-500', approved: 'text-green-600', rejected: 'text-red-500' };

  return (
    <div className="space-y-5 animate-fadeIn">
      <div className="flex items-center justify-between">
        <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
          className="text-sm bg-white border border-gray-200 rounded-xl px-3 py-2 outline-none focus:border-red-300">
          <option value="">Tous les statuts</option>
          <option value="pending">En attente</option>
          <option value="approved">Approuvées</option>
          <option value="rejected">Rejetées</option>
        </select>
        <span className="text-xs text-gray-400">Total : {pagination?.total || 0} demandes</span>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-16">
            <svg className="animate-spin w-7 h-7 text-red-600" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="30 70" />
            </svg>
          </div>
        ) : requests.length === 0 ? (
          <div className="text-center py-16">
            <RefreshCw size={32} className="text-gray-300 mx-auto mb-3" />
            <p className="text-sm text-gray-400">Aucune demande de recharge</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/50">
                    <th className="text-xs font-semibold text-gray-500 px-5 py-3 text-left">Tenant</th>
                    <th className="text-xs font-semibold text-gray-500 px-5 py-3 text-left">Demandeur</th>
                    <th className="text-xs font-semibold text-gray-500 px-5 py-3 text-right">Crédits</th>
                    <th className="text-xs font-semibold text-gray-500 px-5 py-3 text-left hidden md:table-cell">Note</th>
                    <th className="text-xs font-semibold text-gray-500 px-5 py-3 text-left">Date</th>
                    <th className="text-xs font-semibold text-gray-500 px-5 py-3 text-center">Statut</th>
                    <th className="text-xs font-semibold text-gray-500 px-5 py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {requests.map(r => {
                    const StatusIcon = STATUS_ICONS[r.status] || Clock;
                    return (
                      <tr key={r.id} className="border-b border-gray-50 hover:bg-gray-50/30 transition-colors">
                        <td className="px-5 py-3.5">
                          <p className="text-sm font-semibold text-gray-800">{r.tenant_name}</p>
                        </td>
                        <td className="px-5 py-3.5 text-sm text-gray-600">{r.requester_email}</td>
                        <td className="px-5 py-3.5 text-right">
                          <span className="text-sm font-bold text-gray-800">{r.credits_amount?.toLocaleString('fr-FR')}</span>
                        </td>
                        <td className="px-5 py-3.5 hidden md:table-cell text-xs text-gray-500 max-w-xs truncate">{r.note || '—'}</td>
                        <td className="px-5 py-3.5 text-xs text-gray-400">{fmtDateTime(r.created_at)}</td>
                        <td className="px-5 py-3.5 text-center">
                          <span className={`flex items-center gap-1.5 justify-center text-xs font-medium px-2.5 py-1 rounded-full w-fit mx-auto ${RECHARGE_STATUS_COLORS[r.status]}`}>
                            <StatusIcon size={10} />
                            {RECHARGE_STATUS_LABELS[r.status]}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-right">
                          {r.status === 'pending' && (
                            <button onClick={() => { setReviewing(r); setReviewNote(''); }}
                              className="text-xs text-red-600 hover:text-red-700 font-medium px-2.5 py-1 border border-red-200 rounded-lg hover:bg-red-50 transition-colors">
                              Traiter
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <Pagination pagination={pagination} onPage={setPage} />
          </>
        )}
      </div>

      <Modal open={!!reviewing} onClose={() => setReviewing(null)} title="Traiter la demande">
        {reviewing && (
          <div className="space-y-4">
            <div className="bg-gray-50 rounded-xl p-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Tenant</span>
                <span className="font-semibold text-gray-800">{reviewing.tenant_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Demandeur</span>
                <span className="font-medium text-gray-700">{reviewing.requester_email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Crédits demandés</span>
                <span className="font-bold text-gray-900 text-base">{reviewing.credits_amount?.toLocaleString('fr-FR')}</span>
              </div>
              {reviewing.note && (
                <div className="pt-2 border-t border-gray-200">
                  <p className="text-gray-500 text-xs mb-0.5">Note du client</p>
                  <p className="text-gray-700">{reviewing.note}</p>
                </div>
              )}
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Note admin (optionnel)</label>
              <textarea value={reviewNote} onChange={e => setReviewNote(e.target.value)}
                placeholder="Raison du rejet ou commentaire pour le client..."
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
