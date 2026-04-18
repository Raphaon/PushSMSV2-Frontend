'use client';
import { useState } from 'react';
import { User, Lock, Mail, Phone, Shield } from 'lucide-react';
import { authApi, getErrMsg } from '@/lib/api';
import { getUser, setSession, getToken } from '@/lib/auth';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import toast from 'react-hot-toast';

export default function ProfilePage() {
  const user = getUser();
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirm: '' });
  const [saving, setSaving] = useState(false);

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (pwForm.newPassword !== pwForm.confirm) {
      toast.error('Les mots de passe ne correspondent pas');
      return;
    }
    if (pwForm.newPassword.length < 8) {
      toast.error('Le mot de passe doit faire au moins 8 caractères');
      return;
    }
    setSaving(true);
    try {
      await authApi.changePassword({
        currentPassword: pwForm.currentPassword,
        newPassword: pwForm.newPassword,
      });
      toast.success('Mot de passe modifié avec succès');
      setPwForm({ currentPassword: '', newPassword: '', confirm: '' });
    } catch (err) {
      toast.error(getErrMsg(err));
    }
    setSaving(false);
  };

  const roleLabel = { ADMIN: 'Administrateur', OPERATOR: 'Opérateur', SUPERADMIN: 'Super Admin' };
  const roleColor = { ADMIN: 'bg-blue-100 text-blue-700', OPERATOR: 'bg-gray-100 text-gray-600', SUPERADMIN: 'bg-red-100 text-red-700' };

  return (
    <div className="space-y-6 animate-fadeIn max-w-2xl">
      {/* Profile info */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 bg-red-600 rounded-2xl flex items-center justify-center text-white text-2xl font-bold">
            {user?.firstName?.[0]?.toUpperCase() || 'U'}
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900">
              {[user?.firstName, user?.lastName].filter(Boolean).join(' ') || user?.email}
            </h2>
            <div className="flex items-center gap-2 mt-1">
              <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${roleColor[user?.role] || 'bg-gray-100 text-gray-600'}`}>
                {roleLabel[user?.role] || user?.role}
              </span>
              <span className="text-xs text-gray-400">{user?.tenantName}</span>
            </div>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
            <Mail size={14} className="text-gray-400 shrink-0" />
            <div>
              <p className="text-xs text-gray-400">Email</p>
              <p className="text-sm font-medium text-gray-700">{user?.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
            <Shield size={14} className="text-gray-400 shrink-0" />
            <div>
              <p className="text-xs text-gray-400">Rôle</p>
              <p className="text-sm font-medium text-gray-700">{roleLabel[user?.role] || user?.role}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Change password */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <div className="flex items-center gap-2 mb-5">
          <Lock size={16} className="text-gray-500" />
          <h3 className="text-sm font-semibold text-gray-800">Changer le mot de passe</h3>
        </div>
        <form onSubmit={handleChangePassword} className="space-y-4">
          <Input label="Mot de passe actuel *" type="password" placeholder="••••••••" required
            value={pwForm.currentPassword}
            onChange={e => setPwForm(f => ({ ...f, currentPassword: e.target.value }))} />
          <Input label="Nouveau mot de passe *" type="password" placeholder="••••••••" required minLength={8}
            value={pwForm.newPassword}
            onChange={e => setPwForm(f => ({ ...f, newPassword: e.target.value }))} />
          <Input label="Confirmer le nouveau mot de passe *" type="password" placeholder="••••••••" required
            value={pwForm.confirm}
            onChange={e => setPwForm(f => ({ ...f, confirm: e.target.value }))} />
          {pwForm.confirm && pwForm.newPassword !== pwForm.confirm && (
            <p className="text-xs text-red-500">Les mots de passe ne correspondent pas</p>
          )}
          <div className="flex justify-end pt-1">
            <Button type="submit" loading={saving}>Changer le mot de passe</Button>
          </div>
        </form>
      </div>
    </div>
  );
}
