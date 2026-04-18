'use client';
import { useState } from 'react';
import Link from 'next/link';
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react';
import { authApi, getErrMsg } from '@/lib/api';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await authApi.forgotPassword({ email });
      setSent(true);
    } catch { /* Silent — we always show success */ }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'linear-gradient(135deg, #FFF5F5 0%, #FFF 60%)' }}>
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-red-600 rounded-xl flex items-center justify-center shadow-sm">
              <Mail size={18} className="text-white" />
            </div>
            <div>
              <p className="font-bold text-gray-900">PushSMS</p>
              <p className="text-xs text-gray-400">Réinitialisation du mot de passe</p>
            </div>
          </div>

          {sent ? (
            <div className="text-center space-y-4">
              <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle size={28} className="text-green-600" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">Email envoyé !</h2>
                <p className="text-sm text-gray-500 mt-2">
                  Si un compte existe avec l&apos;adresse <strong>{email}</strong>, vous recevrez un lien de réinitialisation sous peu.
                </p>
              </div>
              <Link href="/login" className="block text-center text-sm text-red-600 hover:text-red-700 font-medium">
                Retour à la connexion
              </Link>
            </div>
          ) : (
            <>
              <h2 className="text-xl font-bold text-gray-900 mb-1">Mot de passe oublié</h2>
              <p className="text-sm text-gray-500 mb-6">
                Entrez votre adresse email. Nous vous enverrons un lien pour réinitialiser votre mot de passe.
              </p>
              <form onSubmit={handleSubmit} className="space-y-4">
                <Input label="Adresse email" type="email" placeholder="vous@exemple.com" required
                  value={email} onChange={e => setEmail(e.target.value)} />
                <Button type="submit" loading={loading} className="w-full justify-center">
                  Envoyer le lien
                </Button>
              </form>
              <div className="mt-4 text-center">
                <Link href="/login" className="flex items-center justify-center gap-1.5 text-sm text-gray-500 hover:text-gray-700">
                  <ArrowLeft size={14} /> Retour à la connexion
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
