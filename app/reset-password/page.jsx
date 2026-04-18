'use client';
import { useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Lock, CheckCircle } from 'lucide-react';
import { authApi, getErrMsg } from '@/lib/api';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import toast from 'react-hot-toast';

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const [form, setForm] = useState({ newPassword: '', confirm: '' });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.newPassword !== form.confirm) {
      toast.error('Les mots de passe ne correspondent pas');
      return;
    }
    if (!token) {
      toast.error('Lien invalide');
      return;
    }
    setLoading(true);
    try {
      await authApi.resetPassword({ token, newPassword: form.newPassword });
      setSuccess(true);
      setTimeout(() => router.push('/login'), 3000);
    } catch (err) {
      toast.error(getErrMsg(err));
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'linear-gradient(135deg, #FFF5F5 0%, #FFF 60%)' }}>
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-red-600 rounded-xl flex items-center justify-center shadow-sm">
              <Lock size={18} className="text-white" />
            </div>
            <div>
              <p className="font-bold text-gray-900">PushSMS</p>
              <p className="text-xs text-gray-400">Nouveau mot de passe</p>
            </div>
          </div>

          {success ? (
            <div className="text-center space-y-4">
              <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle size={28} className="text-green-600" />
              </div>
              <h2 className="text-lg font-bold text-gray-900">Mot de passe modifié !</h2>
              <p className="text-sm text-gray-500">Redirection vers la connexion dans 3 secondes...</p>
              <Link href="/login" className="block text-center text-sm text-red-600 hover:text-red-700 font-medium">
                Se connecter maintenant
              </Link>
            </div>
          ) : !token ? (
            <div className="text-center space-y-3">
              <p className="text-sm text-red-600">Lien invalide ou expiré.</p>
              <Link href="/forgot-password" className="text-sm text-red-600 hover:underline">
                Demander un nouveau lien
              </Link>
            </div>
          ) : (
            <>
              <h2 className="text-xl font-bold text-gray-900 mb-1">Nouveau mot de passe</h2>
              <p className="text-sm text-gray-500 mb-6">Choisissez un mot de passe d&apos;au moins 8 caractères.</p>
              <form onSubmit={handleSubmit} className="space-y-4">
                <Input label="Nouveau mot de passe *" type="password" placeholder="••••••••" required minLength={8}
                  value={form.newPassword} onChange={e => setForm(f => ({ ...f, newPassword: e.target.value }))} />
                <Input label="Confirmer le mot de passe *" type="password" placeholder="••••••••" required
                  value={form.confirm} onChange={e => setForm(f => ({ ...f, confirm: e.target.value }))} />
                {form.confirm && form.newPassword !== form.confirm && (
                  <p className="text-xs text-red-500">Les mots de passe ne correspondent pas</p>
                )}
                <Button type="submit" loading={loading} className="w-full justify-center">
                  Réinitialiser le mot de passe
                </Button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense>
      <ResetPasswordForm />
    </Suspense>
  );
}
