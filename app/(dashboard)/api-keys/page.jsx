'use client';
import { useState, useEffect } from 'react';
import { Plus, Key, Trash2, Copy, Eye, EyeOff, BookOpen, ChevronDown } from 'lucide-react';
import { apiKeysApi, getErrMsg } from '@/lib/api';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import EmptyState from '@/components/ui/EmptyState';
import Input from '@/components/ui/Input';
import { fmtDateTime } from '@/lib/utils';
import toast from 'react-hot-toast';

export default function ApiKeysPage() {
  const [keys, setKeys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: '' });
  const [creating, setCreating] = useState(false);
  const [newKey, setNewKey] = useState(null);
  const [revealed, setRevealed] = useState({});
  const [showDocs, setShowDocs] = useState(false);
  const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';
  const API_DOCS = [
    { method: 'POST', path: '/auth/login', color: 'bg-green-100 text-green-700', desc: 'Obtenir un token JWT', example: `curl -X POST ${API_BASE}/auth/login \\
  -H "Content-Type: application/json" \\
  -d '{"email":"vous@exemple.com","password":"motdepasse"}'` },
    { method: 'POST', path: '/messages/send', color: 'bg-blue-100 text-blue-700', desc: 'Envoyer un SMS (auth par clé API)', example: `curl -X POST ${API_BASE}/messages/send \\
  -H "X-API-Key: psk_xxxxxx_votre_cle" \\
  -H "Content-Type: application/json" \\
  -d '{"senderIdId":"uuid","destinations":["+237600000001"],"message":"Bonjour !"}'` },
    { method: 'GET', path: '/contacts', color: 'bg-purple-100 text-purple-700', desc: 'Lister les contacts', example: `curl ${API_BASE}/contacts?page=1&limit=20 \\
  -H "X-API-Key: psk_xxxxxx_votre_cle"` },
    { method: 'POST', path: '/contacts', color: 'bg-green-100 text-green-700', desc: 'Créer un contact', example: `curl -X POST ${API_BASE}/contacts \\
  -H "X-API-Key: psk_xxxxxx_votre_cle" \\
  -H "Content-Type: application/json" \\
  -d '{"firstName":"Jean","lastName":"Dupont","phoneNumber":"+237600000001","email":"jean@exemple.com"}'` },
    { method: 'GET', path: '/campaigns', color: 'bg-purple-100 text-purple-700', desc: 'Lister les campagnes', example: `curl ${API_BASE}/campaigns \\
  -H "X-API-Key: psk_xxxxxx_votre_cle"` },
    { method: 'GET', path: '/wallet', color: 'bg-purple-100 text-purple-700', desc: 'Consulter le portefeuille (solde et crédits)', example: `curl ${API_BASE}/wallet \\
  -H "X-API-Key: psk_xxxxxx_votre_cle"` },
  ];

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await apiKeysApi.list();
      setKeys(data.data || []);
    } catch { /* */ }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setCreating(true);
    try {
      const { data } = await apiKeysApi.create(form);
      setNewKey(data.data);
      setForm({ name: '' });
      load();
    } catch (err) { toast.error(getErrMsg(err)); }
    setCreating(false);
  };

  const handleRevoke = async (id, name) => {
    if (!confirm(`Révoquer la clé "${name}" ? Cette action est irréversible.`)) return;
    try {
      await apiKeysApi.revoke(id);
      toast.success('Clé API révoquée');
      load();
    } catch (err) { toast.error(getErrMsg(err)); }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => toast.success('Copié !'));
  };

  const toggleReveal = (id) => setRevealed(r => ({ ...r, [id]: !r[id] }));

  return (
    <div className="space-y-5 animate-fadeIn">
      <div className="flex items-center justify-between">
        <div />
        <Button onClick={() => setShowModal(true)}><Plus size={15} /> Nouvelle clé API</Button>
      </div>

      {/* New key reveal banner */}
      {newKey && (
        <div className="bg-green-50 border border-green-200 rounded-2xl p-5">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-green-800 mb-1">Clé créée — copiez-la maintenant !</p>
              <p className="text-xs text-green-700 mb-3">Elle ne sera plus affichée en clair après cette page.</p>
              <div className="flex items-center gap-2 bg-white rounded-xl border border-green-200 px-3 py-2">
                <code className="text-xs text-gray-700 flex-1 break-all">{newKey.key}</code>
                <button onClick={() => copyToClipboard(newKey.key)}
                  className="p-1 rounded hover:bg-green-50 text-green-600 transition-colors shrink-0">
                  <Copy size={13} />
                </button>
              </div>
            </div>
            <button onClick={() => setNewKey(null)}
              className="text-green-500 hover:text-green-700 text-lg font-bold leading-none shrink-0">×</button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-16">
            <svg className="animate-spin w-7 h-7 text-red-600" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="30 70" />
            </svg>
          </div>
        ) : keys.length === 0 ? (
          <EmptyState icon={Key} title="Aucune clé API"
            description="Créez des clés API pour intégrer PushSMS dans vos applications."
            action={<Button onClick={() => setShowModal(true)}><Plus size={14} /> Créer</Button>} />
        ) : (
          <div className="divide-y divide-gray-50">
            {keys.map(k => (
              <div key={k.id} className="flex items-center justify-between px-5 py-4 hover:bg-gray-50/30 transition-colors">
                <div className="flex items-center gap-4 min-w-0 flex-1">
                  <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center shrink-0">
                    <Key size={16} className="text-gray-500" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-gray-800">{k.name}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <code className="text-xs text-gray-500 font-mono truncate max-w-xs">
                        {revealed[k.id] ? (k.key_preview || k.key_hash?.substring(0, 32) + '...') : (k.key_prefix ? `${k.key_prefix}${'•'.repeat(20)}` : '••••••••••••••••••••••••')}
                      </code>
                      <button onClick={() => toggleReveal(k.id)}
                        className="text-gray-400 hover:text-gray-600 transition-colors shrink-0">
                        {revealed[k.id] ? <EyeOff size={11} /> : <Eye size={11} />}
                      </button>
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5">
                      Créée le {fmtDateTime(k.created_at)}
                      {k.last_used_at && ` · Dernière utilisation ${fmtDateTime(k.last_used_at)}`}
                    </p>
                  </div>
                </div>
                <button onClick={() => handleRevoke(k.id, k.name)}
                  className="ml-4 p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors shrink-0">
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* API Documentation */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <button onClick={() => setShowDocs(!showDocs)}
          className="w-full flex items-center justify-between px-5 py-4 hover:bg-gray-50/50 transition-colors">
          <div className="flex items-center gap-2">
            <BookOpen size={15} className="text-gray-500" />
            <span className="text-sm font-semibold text-gray-700">Documentation API</span>
          </div>
          <ChevronDown size={14} className={`text-gray-400 transition-transform duration-200 ${showDocs ? 'rotate-180' : ''}`} />
        </button>
        {showDocs && (
          <div className="border-t border-gray-100 px-5 pb-5 space-y-4 pt-4">
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-sm text-blue-800">
              <p className="font-semibold mb-1">Authentification</p>
              <p>Utilisez votre clé API dans le header <code className="bg-blue-100 px-1.5 py-0.5 rounded text-xs">X-API-Key</code> ou un token JWT dans <code className="bg-blue-100 px-1.5 py-0.5 rounded text-xs">Authorization: Bearer TOKEN</code>.</p>
              <p className="mt-1 text-xs text-blue-600">Base URL : <code className="bg-blue-100 px-1.5 py-0.5 rounded">{API_BASE}</code></p>
            </div>
            <div className="space-y-3">
              {API_DOCS.map((doc, i) => (
                <div key={i} className="border border-gray-100 rounded-xl overflow-hidden">
                  <div className="flex items-center gap-3 px-4 py-2.5 bg-gray-50/80">
                    <span className={`text-xs font-bold px-2 py-0.5 rounded ${doc.color}`}>{doc.method}</span>
                    <code className="text-xs text-gray-700 font-mono">{doc.path}</code>
                    <span className="text-xs text-gray-500 ml-auto">{doc.desc}</span>
                  </div>
                  <pre className="text-xs bg-gray-900 text-green-400 px-4 py-3 overflow-x-auto leading-relaxed">
                    {doc.example}
                  </pre>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <Modal open={showModal} onClose={() => setShowModal(false)} title="Nouvelle clé API">
        <form onSubmit={handleCreate} className="space-y-4">
          <Input label="Nom de la clé *" placeholder="Production App" required
            value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
          <div className="bg-gray-50 rounded-xl p-3 text-xs text-gray-500">
            La clé sera affichée une seule fois à la création. Conservez-la en lieu sûr.
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" type="button" onClick={() => setShowModal(false)}>Annuler</Button>
            <Button type="submit" loading={creating}>Générer la clé</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
