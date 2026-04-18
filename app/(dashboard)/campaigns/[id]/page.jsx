'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Send, X, BarChart2, Users, CheckCircle, XCircle, Clock, AlertCircle } from 'lucide-react';
import { campaignsApi, messagesApi, getErrMsg } from '@/lib/api';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Pagination from '@/components/ui/Pagination';
import { fmtDateTime, fmtNumber, CAMPAIGN_STATUS_COLORS, CAMPAIGN_STATUS_LABELS, MSG_STATUS_COLORS } from '@/lib/utils';
import toast from 'react-hot-toast';

const StatCard = ({ icon: Icon, label, value, color = 'text-gray-800' }) => (
  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
    <div className="flex items-center gap-3 mb-3">
      <div className="w-9 h-9 rounded-xl bg-gray-50 flex items-center justify-center">
        <Icon size={16} className="text-gray-500" />
      </div>
      <span className="text-sm text-gray-500">{label}</span>
    </div>
    <p className={`text-2xl font-bold ${color}`}>{value}</p>
  </div>
);

const MSG_STATUS_LABELS = {
  queued: 'En attente', sent: 'Envoyé', delivered: 'Livré', failed: 'Échoué', skipped: 'Ignoré',
};

export default function CampaignDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [campaign, setCampaign] = useState(null);
  const [report, setReport] = useState(null);
  const [messages, setMessages] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [launching, setLaunching] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [c, r] = await Promise.all([
          campaignsApi.get(id),
          campaignsApi.report(id),
        ]);
        setCampaign(c.data.data);
        setReport(r.data.data);
      } catch (err) { toast.error(getErrMsg(err)); }
      setLoading(false);
    };
    load();
  }, [id]);

  useEffect(() => {
    const loadMsgs = async () => {
      try {
        const { data } = await messagesApi.list({ campaign_id: id, page, limit: 20, status: statusFilter || undefined });
        setMessages(data.data || []);
        setPagination(data.pagination);
      } catch { /* */ }
    };
    if (id) loadMsgs();
  }, [id, page, statusFilter]);

  const handleLaunch = async () => {
    if (!confirm('Lancer cette campagne maintenant ? Les crédits seront débités.')) return;
    setLaunching(true);
    try {
      await campaignsApi.launch(id);
      toast.success('Campagne lancée !');
      const { data } = await campaignsApi.get(id);
      setCampaign(data.data);
    } catch (err) { toast.error(getErrMsg(err)); }
    setLaunching(false);
  };

  const handleCancel = async () => {
    if (!confirm('Annuler cette campagne ?')) return;
    try {
      await campaignsApi.cancel(id);
      toast.success('Campagne annulée');
      const { data } = await campaignsApi.get(id);
      setCampaign(data.data);
    } catch (err) { toast.error(getErrMsg(err)); }
  };

  if (loading) return (
    <div className="flex justify-center py-24">
      <svg className="animate-spin w-7 h-7 text-red-600" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="30 70" />
      </svg>
    </div>
  );

  if (!campaign) return null;

  const sentPct = campaign.target_count > 0
    ? Math.min(100, Math.round((campaign.sent_count / campaign.target_count) * 100))
    : 0;

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()}
            className="w-9 h-9 rounded-xl border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors">
            <ArrowLeft size={16} className="text-gray-600" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-gray-900">{campaign.name}</h1>
            <p className="text-xs text-gray-400 mt-0.5">{campaign.type} · Créée le {fmtDateTime(campaign.created_at)}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge className={CAMPAIGN_STATUS_COLORS[campaign.status]}>
            {CAMPAIGN_STATUS_LABELS[campaign.status]}
          </Badge>
          {['DRAFT', 'SCHEDULED'].includes(campaign.status) && (
            <>
              <Button size="sm" variant="success" loading={launching} onClick={handleLaunch}>
                <Send size={12} /> Lancer
              </Button>
              <Button size="sm" variant="danger" onClick={handleCancel}>
                <X size={12} /> Annuler
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Users} label="Destinataires" value={fmtNumber(campaign.target_count)} />
        <StatCard icon={CheckCircle} label="Envoyés" value={fmtNumber(campaign.sent_count)} color="text-green-600" />
        <StatCard icon={XCircle} label="Échecs" value={fmtNumber(campaign.failed_count)} color="text-red-600" />
        <StatCard icon={BarChart2} label="Crédits utilisés" value={fmtNumber(campaign.actual_cost)} color="text-blue-700" />
      </div>

      {/* Progress */}
      {campaign.target_count > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-gray-600 font-medium">Progression de l'envoi</span>
            <span className="font-bold text-gray-800">{sentPct}%</span>
          </div>
          <div className="w-full h-2.5 bg-gray-100 rounded-full">
            <div className="h-2.5 bg-gradient-to-r from-green-400 to-green-600 rounded-full transition-all"
              style={{ width: `${sentPct}%` }} />
          </div>
          <div className="flex justify-between text-xs text-gray-400 mt-1.5">
            <span>{fmtNumber(campaign.sent_count)} envoyés</span>
            <span>{fmtNumber(campaign.target_count)} total</span>
          </div>
        </div>
      )}

      {/* Report breakdown */}
      {report && report.by_status && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">Rapport de livraison</h2>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {Object.entries(report.by_status).map(([status, count]) => (
              <div key={status} className="text-center p-3 rounded-xl bg-gray-50">
                <p className="text-lg font-bold text-gray-800">{fmtNumber(count)}</p>
                <Badge className={`mt-1 text-xs ${MSG_STATUS_COLORS[status] || 'bg-gray-100 text-gray-600'}`}>
                  {MSG_STATUS_LABELS[status] || status}
                </Badge>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Message body */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <h2 className="text-sm font-semibold text-gray-700 mb-3">Message envoyé</h2>
        <div className="bg-gray-50 rounded-xl p-4 text-sm text-gray-700 whitespace-pre-wrap">
          {campaign.message_body}
        </div>
        <p className="text-xs text-gray-400 mt-2">{campaign.message_body?.length || 0} caractères</p>
      </div>

      {/* Messages table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h2 className="text-sm font-semibold text-gray-700">Destinataires individuels</h2>
          <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
            className="text-xs bg-white border border-gray-200 rounded-lg px-2.5 py-1.5 outline-none focus:border-red-300 text-gray-600">
            <option value="">Tous</option>
            {Object.entries(MSG_STATUS_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
        </div>
        {messages.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-10">Aucun message</p>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/50">
                    <th className="text-xs font-semibold text-gray-500 px-5 py-3 text-left">Téléphone</th>
                    <th className="text-xs font-semibold text-gray-500 px-5 py-3 text-left">Statut</th>
                    <th className="text-xs font-semibold text-gray-500 px-5 py-3 text-left hidden md:table-cell">Crédits</th>
                    <th className="text-xs font-semibold text-gray-500 px-5 py-3 text-left hidden lg:table-cell">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {messages.map(m => (
                    <tr key={m.id} className="border-b border-gray-50 hover:bg-gray-50/30 transition-colors">
                      <td className="px-5 py-3 text-sm font-medium text-gray-800">{m.phone_number}</td>
                      <td className="px-5 py-3">
                        <Badge className={MSG_STATUS_COLORS[m.status] || 'bg-gray-100 text-gray-600'}>
                          {MSG_STATUS_LABELS[m.status] || m.status}
                        </Badge>
                      </td>
                      <td className="px-5 py-3 hidden md:table-cell text-sm text-gray-600">{fmtNumber(m.total_price)}</td>
                      <td className="px-5 py-3 hidden lg:table-cell text-xs text-gray-400">{fmtDateTime(m.sent_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination pagination={pagination} onPage={setPage} />
          </>
        )}
      </div>
    </div>
  );
}
