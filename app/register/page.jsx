'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Mail, Lock, Eye, EyeOff, Building2, User } from 'lucide-react';
import { authApi, getErrMsg } from '@/lib/api';
import { setSession } from '@/lib/auth';
import toast from 'react-hot-toast';

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    companyName: '', firstName: '', lastName: '',
    email: '', password: '', confirmPassword: '',
  });
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);

  const set = (key) => (e) => setForm(f => ({ ...f, [key]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      toast.error('Les mots de passe ne correspondent pas');
      return;
    }
    setLoading(true);
    try {
      const { data } = await authApi.register({
        companyName: form.companyName,
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        password: form.password,
      });
      setSession(data.data.token, data.data.user);
      toast.success('Compte créé avec succès !');
      router.push('/dashboard');
    } catch (err) {
      toast.error(getErrMsg(err));
    }
    setLoading(false);
  };

  const strength = (() => {
    const p = form.password;
    if (!p) return 0;
    let s = 0;
    if (p.length >= 8) s++;
    if (/[A-Z]/.test(p)) s++;
    if (/[0-9]/.test(p)) s++;
    if (/[^A-Za-z0-9]/.test(p)) s++;
    return s;
  })();
  const strengthLabel = ['', 'Faible', 'Moyen', 'Bon', 'Fort'][strength];
  const strengthColor = ['', 'bg-red-400', 'bg-orange-400', 'bg-yellow-400', 'bg-green-500'][strength];

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-red-50 to-pink-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-3xl shadow-xl shadow-red-100/50 border border-red-50 px-8 py-9">
          {/* Logo */}
          <div className="flex flex-col items-center mb-7">
            <div className="w-14 h-14 bg-gradient-to-br from-red-500 to-rose-600 rounded-2xl flex items-center justify-center shadow-lg shadow-red-200 mb-4">
              <Mail size={26} className="text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Créer votre compte</h1>
            <p className="text-sm text-gray-500 mt-1 text-center">
              Lancez votre plateforme SMS en quelques secondes
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Company */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Nom de l'entreprise *</label>
              <div className="relative">
                <Building2 size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input type="text" placeholder="Acme Corp" required value={form.companyName} onChange={set('companyName')}
                  className="w-full pl-10 pr-4 py-3 text-sm bg-gray-50 border border-gray-200 rounded-xl
                    outline-none focus:border-red-400 focus:ring-2 focus:ring-red-100 transition-all" />
              </div>
            </div>

            {/* Name */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Prénom *</label>
                <div className="relative">
                  <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input type="text" placeholder="Jean" required value={form.firstName} onChange={set('firstName')}
                    className="w-full pl-10 pr-4 py-3 text-sm bg-gray-50 border border-gray-200 rounded-xl
                      outline-none focus:border-red-400 focus:ring-2 focus:ring-red-100 transition-all" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Nom *</label>
                <input type="text" placeholder="Dupont" required value={form.lastName} onChange={set('lastName')}
                  className="w-full px-4 py-3 text-sm bg-gray-50 border border-gray-200 rounded-xl
                    outline-none focus:border-red-400 focus:ring-2 focus:ring-red-100 transition-all" />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Adresse email *</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input type="email" placeholder="jean@acme.com" required value={form.email} onChange={set('email')}
                  className="w-full pl-10 pr-4 py-3 text-sm bg-gray-50 border border-gray-200 rounded-xl
                    outline-none focus:border-red-400 focus:ring-2 focus:ring-red-100 transition-all" />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Mot de passe *</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input type={showPwd ? 'text' : 'password'} placeholder="8 caractères minimum" required
                  value={form.password} onChange={set('password')} minLength={8}
                  className="w-full pl-10 pr-11 py-3 text-sm bg-gray-50 border border-gray-200 rounded-xl
                    outline-none focus:border-red-400 focus:ring-2 focus:ring-red-100 transition-all" />
                <button type="button" onClick={() => setShowPwd(!showPwd)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">
                  {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {form.password && (
                <div className="mt-2">
                  <div className="flex gap-1 mb-1">
                    {[1, 2, 3, 4].map(i => (
                      <div key={i} className={`flex-1 h-1 rounded-full transition-all ${i <= strength ? strengthColor : 'bg-gray-200'}`} />
                    ))}
                  </div>
                  <p className="text-xs text-gray-400">{strengthLabel}</p>
                </div>
              )}
            </div>

            {/* Confirm password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Confirmer le mot de passe *</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input type={showPwd ? 'text' : 'password'} placeholder="••••••••" required
                  value={form.confirmPassword} onChange={set('confirmPassword')}
                  className={`w-full pl-10 pr-4 py-3 text-sm bg-gray-50 border rounded-xl
                    outline-none focus:ring-2 transition-all
                    ${form.confirmPassword && form.confirmPassword !== form.password
                      ? 'border-red-300 focus:border-red-400 focus:ring-red-100'
                      : 'border-gray-200 focus:border-red-400 focus:ring-red-100'}`} />
              </div>
              {form.confirmPassword && form.confirmPassword !== form.password && (
                <p className="mt-1 text-xs text-red-500">Les mots de passe ne correspondent pas</p>
              )}
            </div>

            <button type="submit" disabled={loading}
              className="w-full bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700
                text-white font-semibold py-3 rounded-xl transition-all shadow-lg shadow-red-200 hover:shadow-red-300
                flex items-center justify-center gap-2
                disabled:opacity-60 disabled:cursor-not-allowed mt-2 text-sm">
              {loading ? (
                <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="30 70" />
                </svg>
              ) : null}
              Créer mon compte
            </button>
          </form>

          <p className="text-center text-xs text-gray-400 mt-4">
            En créant un compte, vous acceptez nos{' '}
            <span className="text-red-500 cursor-pointer hover:underline">conditions d'utilisation</span>
          </p>

          <p className="text-center text-sm text-gray-500 mt-4">
            Déjà un compte ?{' '}
            <Link href="/login" className="text-red-600 hover:text-red-700 font-medium">Se connecter</Link>
          </p>
        </div>

        <p className="text-center text-xs text-gray-400 mt-5">
          © 2026 PushSMS — Tous droits réservés
        </p>
      </div>
    </div>
  );
}
