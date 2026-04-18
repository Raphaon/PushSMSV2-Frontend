'use client';
import { useEffect, useState } from 'react';
import { Megaphone, Users, MessageSquare, CreditCard, Plus, ArrowRight, Send, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import { campaignsApi, contactsApi, walletApi, messagesApi } from '@/lib/api';
import { StatCard } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import { fmtCurrency, fmtNumber, fmtDateTime, CAMPAIGN_STATUS_COLORS, CAMPAIGN_STATUS_LABELS } from '@/lib/utils';

export default function DashboardPage() {
  const [stats, setStats] = useState(null);
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [wallet, contacts, cmpList] = await Promise.all([
          walletApi.get(),
          contactsApi.list({ limit: 1 }),
          campaignsApi.list({ limit: 5 }),
        ]);
        setStats({
          balance: wallet.data.data?.availableBalance ?? 0,
          currency: 'XAF',
          contacts: contacts.data.pagination?.total ?? 0,
          campaigns: cmpList.data.pagination?.total ?? 0,
        });
        setCampaigns(cmpList.data.data || []);
      } catch { /* silently fail */ }
      setLoading(false);
    };
    load();
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <svg className="animate-spin w-8 h-8 text-red-600" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="30 70" />
      </svg>
    </div>
  );

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Welcome */}
      <div className="bg-gradient-to-r from-red-600 to-red-500 rounded-2xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold mb-1">Bienvenue sur PushSMS</h2>
            <p className="text-red-100 text-sm">Gérez vos campagnes SMS en toute simplicité.</p>
          </div>
          <Link href="/campaigns"
            className="bg-white text-red-600 font-semibold px-4 py-2.5 rounded-xl
              hover:bg-red-50 transition-colors flex items-center gap-2 text-sm shadow-sm">
            <Plus size={15} />
            Nouvelle campagne
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={CreditCard} label="Solde disponible" value={fmtCurrency(stats?.balance, 'XAF')} color="green" />
        <StatCard icon={Megaphone} label="Campagnes totales" value={fmtNumber(stats?.campaigns)} color="red" />
        <StatCard icon={Users} label="Contacts totaux" value={fmtNumber(stats?.contacts)} color="blue" />
        <StatCard icon={MessageSquare} label="SMS envoyés" value="—" sub="Ce mois" color="purple" />
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { href: '/campaigns', icon: Send, label: 'Lancer une campagne', color: 'bg-red-50 text-red-600' },
          { href: '/contacts', icon: Users, label: 'Ajouter des contacts', color: 'bg-blue-50 text-blue-600' },
          { href: '/sms-templates', icon: MessageSquare, label: 'Créer un modèle', color: 'bg-purple-50 text-purple-600' },
          { href: '/wallet', icon: CreditCard, label: 'Recharger le wallet', color: 'bg-green-50 text-green-600' },
        ].map(({ href, icon: Icon, label, color }) => (
          <Link key={href} href={href}
            className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex flex-col
              gap-3 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 group">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${color}`}>
              <Icon size={16} />
            </div>
            <p className="text-sm font-semibold text-gray-700 group-hover:text-gray-900">{label}</p>
          </Link>
        ))}
      </div>

      {/* Recent campaigns */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <TrendingUp size={16} className="text-red-600" />
            <h3 className="font-bold text-gray-900 text-sm">Campagnes récentes</h3>
          </div>
          <Link href="/campaigns" className="text-xs text-red-600 hover:text-red-700 font-medium flex items-center gap-1">
            Voir tout <ArrowRight size={12} />
          </Link>
        </div>
        {campaigns.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Megaphone size={32} className="text-gray-300 mb-3" />
            <p className="text-sm text-gray-500">Aucune campagne pour l&apos;instant</p>
            <Link href="/campaigns" className="mt-3 text-xs text-red-600 font-medium hover:underline">
              Créer votre première campagne
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-50">
                  <th className="text-xs font-semibold text-gray-500 px-5 py-3 text-left">Nom</th>
                  <th className="text-xs font-semibold text-gray-500 px-5 py-3 text-left">Statut</th>
                  <th className="text-xs font-semibold text-gray-500 px-5 py-3 text-left hidden md:table-cell">Envoyés</th>
                  <th className="text-xs font-semibold text-gray-500 px-5 py-3 text-left hidden lg:table-cell">Coût</th>
                  <th className="text-xs font-semibold text-gray-500 px-5 py-3 text-left hidden lg:table-cell">Date</th>
                  <th className="px-5 py-3" />
                </tr>
              </thead>
              <tbody>
                {campaigns.map(c => (
                  <tr key={c.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                    <td className="px-5 py-3">
                      <p className="text-sm font-semibold text-gray-800">{c.name}</p>
                      <p className="text-xs text-gray-400">{c.type}</p>
                    </td>
                    <td className="px-5 py-3">
                      <Badge className={CAMPAIGN_STATUS_COLORS[c.status]}>
                        {CAMPAIGN_STATUS_LABELS[c.status]}
                      </Badge>
                    </td>
                    <td className="px-5 py-3 hidden md:table-cell">
                      <span className="text-sm text-gray-700">{fmtNumber(c.sent_count)} / {fmtNumber(c.target_count)}</span>
                    </td>
                    <td className="px-5 py-3 hidden lg:table-cell">
                      <span className="text-sm text-gray-700">{fmtCurrency(c.actual_cost)}</span>
                    </td>
                    <td className="px-5 py-3 hidden lg:table-cell">
                      <span className="text-xs text-gray-500">{fmtDateTime(c.created_at)}</span>
                    </td>
                    <td className="px-5 py-3">
                      <Link href={`/campaigns/${c.id}`}
                        className="text-xs text-red-600 hover:text-red-700 font-medium">
                        Détail
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
