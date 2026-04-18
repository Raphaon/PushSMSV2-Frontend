'use client';
import { useState, useEffect } from 'react';
import { Send, Users, Phone, MessageSquare, CheckCircle, XCircle } from 'lucide-react';
import { messagesApi, senderIdsApi, getErrMsg } from '@/lib/api';
import Button from '@/components/ui/Button';
import TemplatePicker from '@/components/ui/TemplatePicker';
import toast from 'react-hot-toast';

const SMS_LIMIT = 160;

export default function SmsPage() {
  const [senders, setSenders] = useState([]);
  const [form, setForm] = useState({ senderIdId: '', destinations: '', message: '' });
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState(null);

  useEffect(() => {
    senderIdsApi.list().then(r => {
      const active = (r.data?.data || []).filter(s => s.status === 'active');
      setSenders(active);
      if (active.length > 0) setForm(f => ({ ...f, senderIdId: active[0].id }));
    }).catch(() => {});
  }, []);

  const destinations = form.destinations
    .split(/[\n,;]+/)
    .map(s => s.trim())
    .filter(Boolean);

  const charCount = form.message.length;
  const parts = charCount === 0 ? 0 : Math.ceil(charCount / SMS_LIMIT);

  const handleSend = async (e) => {
    e.preventDefault();
    if (destinations.length === 0) { toast.error('Ajoutez au moins un numéro'); return; }
    if (!form.message.trim()) { toast.error('Le message est vide'); return; }
    if (!form.senderIdId) { toast.error('Sélectionnez un Sender ID'); return; }

    setSending(true);
    setResult(null);
    try {
      const { data } = await messagesApi.send({
        senderIdId: form.senderIdId,
        destinations,
        message: form.message,
      });
      setResult(data.data);
      toast.success(`${data.data.sent} message(s) envoyé(s)`);
    } catch (err) {
      toast.error(getErrMsg(err));
    }
    setSending(false);
  };

  return (
    <div className="space-y-6 animate-fadeIn max-w-2xl">
      <div>
        <h1 className="text-xl font-bold text-gray-900">SMS Rapide</h1>
        <p className="text-sm text-gray-500 mt-0.5">Envoyez un SMS individuel ou en masse sans créer de campagne</p>
      </div>

      <form onSubmit={handleSend} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">
        {/* Sender ID */}
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1.5">Sender ID *</label>
          {senders.length === 0 ? (
            <p className="text-sm text-red-500">Aucun Sender ID actif. Créez-en un d&apos;abord.</p>
          ) : (
            <select value={form.senderIdId} onChange={e => setForm(f => ({ ...f, senderIdId: e.target.value }))}
              className="w-full px-3 py-2.5 text-sm bg-white border border-gray-200 rounded-xl outline-none focus:border-red-300 focus:ring-2 focus:ring-red-100">
              {senders.map(s => (
                <option key={s.id} value={s.id}>{s.value}</option>
              ))}
            </select>
          )}
        </div>

        {/* Destinations */}
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1.5">
            Destinataires * <span className="font-normal text-gray-400">(un par ligne, ou séparés par virgule)</span>
          </label>
          <div className="relative">
            <Phone size={14} className="absolute left-3 top-3 text-gray-400" />
            <textarea value={form.destinations} onChange={e => setForm(f => ({ ...f, destinations: e.target.value }))}
              placeholder={"+237600000000\n+237611111111\n+237622222222"}
              rows={4}
              className="w-full pl-9 pr-4 py-2.5 text-sm bg-white border border-gray-200 rounded-xl outline-none focus:border-red-300 focus:ring-2 focus:ring-red-100 resize-none font-mono" />
          </div>
          {destinations.length > 0 && (
            <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
              <Users size={11} /> {destinations.length} numéro(s)
            </p>
          )}
        </div>

        {/* Message */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-semibold text-gray-600">Message *</label>
            <TemplatePicker onSelect={t => setForm(f => ({ ...f, message: t.body }))} />
          </div>
          <div className="relative">
            <MessageSquare size={14} className="absolute left-3 top-3 text-gray-400" />
            <textarea value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
              placeholder="Votre message SMS..."
              rows={4}
              maxLength={1600}
              className="w-full pl-9 pr-4 py-2.5 text-sm bg-white border border-gray-200 rounded-xl outline-none focus:border-red-300 focus:ring-2 focus:ring-red-100 resize-none" />
          </div>
          <div className="flex justify-between mt-1 text-xs text-gray-400">
            <span>{charCount} caractère(s)</span>
            {parts > 0 && <span>{parts} SMS / destinataire</span>}
          </div>
        </div>

        <div className="flex justify-end pt-1">
          <Button type="submit" loading={sending} disabled={senders.length === 0}>
            <Send size={14} /> Envoyer
          </Button>
        </div>
      </form>

      {/* Results */}
      {result && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">Résultats de l&apos;envoi</h2>
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="bg-gray-50 rounded-xl p-4 text-center">
              <p className="text-2xl font-bold text-gray-800">{result.total}</p>
              <p className="text-xs text-gray-500 mt-1">Total</p>
            </div>
            <div className="bg-green-50 rounded-xl p-4 text-center">
              <p className="text-2xl font-bold text-green-600">{result.sent}</p>
              <p className="text-xs text-green-500 mt-1">Envoyés</p>
            </div>
            <div className="bg-red-50 rounded-xl p-4 text-center">
              <p className="text-2xl font-bold text-red-600">{result.failed}</p>
              <p className="text-xs text-red-500 mt-1">Échoués</p>
            </div>
          </div>
          {result.results?.length > 0 && (
            <div className="space-y-1 max-h-48 overflow-y-auto">
              {result.results.map((r, i) => (
                <div key={i} className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-gray-50">
                  <span className="text-sm font-mono text-gray-700">{r.destination}</span>
                  <span className={`flex items-center gap-1 text-xs font-medium ${r.status === 'sent' ? 'text-green-600' : 'text-red-500'}`}>
                    {r.status === 'sent' ? <CheckCircle size={12} /> : <XCircle size={12} />}
                    {r.status === 'sent' ? 'Envoyé' : r.reason || 'Échoué'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
