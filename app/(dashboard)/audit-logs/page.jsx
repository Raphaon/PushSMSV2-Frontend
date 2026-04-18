'use client';
import { useState, useEffect, useCallback } from 'react';
import { Shield, Search } from 'lucide-react';
import { auditApi, getErrMsg } from '@/lib/api';
import Pagination from '@/components/ui/Pagination';
import EmptyState from '@/components/ui/EmptyState';
import { fmtDateTime } from '@/lib/utils';

const ACTION_COLORS = {
  CREATE: 'bg-green-100 text-green-700',
  UPDATE: 'bg-blue-100 text-blue-700',
  DELETE: 'bg-red-100 text-red-700',
  LOGIN: 'bg-purple-100 text-purple-700',
  LAUNCH: 'bg-orange-100 text-orange-700',
};

export default function AuditLogsPage() {
  const [logs, setLogs] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [page, setPage] = useState(1);
  const [actionFilter, setActionFilter] = useState('');
  const [resourceFilter, setResourceFilter] = useState('');
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await auditApi.list({
        page,
        limit: 25,
        action: actionFilter || undefined,
        resource_type: resourceFilter || undefined,
      });
      setLogs(data.data || []);
      setPagination(data.pagination);
    } catch { /* */ }
    setLoading(false);
  }, [page, actionFilter, resourceFilter]);

  useEffect(() => { load(); }, [load]);

  const getActionColor = (action) => {
    const key = Object.keys(ACTION_COLORS).find(k => action?.toUpperCase().includes(k));
    return key ? ACTION_COLORS[key] : 'bg-gray-100 text-gray-600';
  };

  return (
    <div className="space-y-5 animate-fadeIn">
      <div className="flex flex-wrap items-center gap-3">
        <select value={actionFilter} onChange={e => { setActionFilter(e.target.value); setPage(1); }}
          className="text-sm bg-white border border-gray-200 rounded-xl px-3 py-2 outline-none focus:border-red-300 focus:ring-2 focus:ring-red-100 text-gray-700">
          <option value="">Toutes les actions</option>
          <option value="CREATE">Création</option>
          <option value="UPDATE">Modification</option>
          <option value="DELETE">Suppression</option>
          <option value="LOGIN">Connexion</option>
          <option value="LAUNCH">Lancement</option>
        </select>
        <input value={resourceFilter} onChange={e => { setResourceFilter(e.target.value); setPage(1); }}
          placeholder="Filtrer par ressource..."
          className="text-sm bg-white border border-gray-200 rounded-xl px-3 py-2 outline-none focus:border-red-300 focus:ring-2 focus:ring-red-100 text-gray-700 w-52" />
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-16">
            <svg className="animate-spin w-7 h-7 text-red-600" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="30 70" />
            </svg>
          </div>
        ) : logs.length === 0 ? (
          <EmptyState icon={Shield} title="Aucun log d'audit"
            description="Les actions importantes sont enregistrées ici." />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/50">
                    <th className="text-xs font-semibold text-gray-500 px-5 py-3 text-left">Action</th>
                    <th className="text-xs font-semibold text-gray-500 px-5 py-3 text-left">Ressource</th>
                    <th className="text-xs font-semibold text-gray-500 px-5 py-3 text-left hidden md:table-cell">Utilisateur</th>
                    <th className="text-xs font-semibold text-gray-500 px-5 py-3 text-left hidden lg:table-cell">IP</th>
                    <th className="text-xs font-semibold text-gray-500 px-5 py-3 text-left">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map(l => (
                    <tr key={l.id} className="border-b border-gray-50 hover:bg-gray-50/30 transition-colors">
                      <td className="px-5 py-3.5">
                        <span className={`inline-flex items-center text-xs font-semibold px-2.5 py-1 rounded-full ${getActionColor(l.action)}`}>
                          {l.action}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <p className="text-sm text-gray-700 font-medium">{l.resource_type}</p>
                        {l.resource_id && (
                          <p className="text-xs text-gray-400 font-mono mt-0.5">{l.resource_id.substring(0, 8)}…</p>
                        )}
                      </td>
                      <td className="px-5 py-3.5 hidden md:table-cell">
                        <p className="text-sm text-gray-700">{l.user_email || l.user_id || '—'}</p>
                      </td>
                      <td className="px-5 py-3.5 hidden lg:table-cell text-xs text-gray-400 font-mono">{l.ip_address || '—'}</td>
                      <td className="px-5 py-3.5 text-xs text-gray-400">{fmtDateTime(l.created_at)}</td>
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
