'use client';
import { useState, useEffect, useCallback } from 'react';
import { Plus, UserCog, Edit2, Trash2, Shield, ShieldOff } from 'lucide-react';
import { usersApi, getErrMsg } from '@/lib/api';
import { isAdmin } from '@/lib/auth';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Modal from '@/components/ui/Modal';
import Pagination from '@/components/ui/Pagination';
import EmptyState from '@/components/ui/EmptyState';
import Input, { Select } from '@/components/ui/Input';
import { fmtDateTime } from '@/lib/utils';
import toast from 'react-hot-toast';

const ROLE_COLORS = { ADMIN: 'bg-red-100 text-red-700', USER: 'bg-gray-100 text-gray-600' };
const STATUS_COLORS = { active: 'bg-green-100 text-green-700', inactive: 'bg-gray-100 text-gray-400' };

const emptyForm = { firstName: '', lastName: '', email: '', password: '', role: 'USER' };

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await usersApi.list({ page, limit: 20 });
      setUsers(data.data || []);
      setPagination(data.pagination);
    } catch { /* */ }
    setLoading(false);
  }, [page]);

  useEffect(() => { load(); }, [load]);

  const openCreate = () => { setEditing(null); setForm(emptyForm); setShowModal(true); };
  const openEdit = (u) => {
    setEditing(u);
    setForm({ firstName: u.first_name || '', lastName: u.last_name || '', email: u.email, password: '', role: u.role });
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = { ...form };
      if (!payload.password) delete payload.password;
      if (editing) {
        await usersApi.update(editing.id, payload);
        toast.success('Utilisateur mis à jour');
      } else {
        await usersApi.create(payload);
        toast.success('Utilisateur créé');
      }
      setShowModal(false);
      load();
    } catch (err) { toast.error(getErrMsg(err)); }
    setSaving(false);
  };

  const handleDelete = async (id) => {
    if (!confirm('Supprimer cet utilisateur ?')) return;
    try {
      await usersApi.delete(id);
      toast.success('Utilisateur supprimé');
      load();
    } catch (err) { toast.error(getErrMsg(err)); }
  };

  return (
    <div className="space-y-5 animate-fadeIn">
      <div className="flex items-center justify-between">
        <div />
        <Button onClick={openCreate}><Plus size={15} /> Nouvel utilisateur</Button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-16">
            <svg className="animate-spin w-7 h-7 text-red-600" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="30 70" />
            </svg>
          </div>
        ) : users.length === 0 ? (
          <EmptyState icon={UserCog} title="Aucun utilisateur"
            description="Invitez des membres à rejoindre votre espace."
            action={<Button onClick={openCreate}><Plus size={14} /> Inviter</Button>} />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/50">
                    <th className="text-xs font-semibold text-gray-500 px-5 py-3 text-left">Utilisateur</th>
                    <th className="text-xs font-semibold text-gray-500 px-5 py-3 text-left">Rôle</th>
                    <th className="text-xs font-semibold text-gray-500 px-5 py-3 text-left hidden md:table-cell">Statut</th>
                    <th className="text-xs font-semibold text-gray-500 px-5 py-3 text-left hidden lg:table-cell">Créé le</th>
                    <th className="text-xs font-semibold text-gray-500 px-5 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(u => (
                    <tr key={u.id} className="border-b border-gray-50 hover:bg-gray-50/30 transition-colors">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center text-xs font-bold text-red-600">
                            {(u.first_name?.[0] || u.email?.[0] || '?').toUpperCase()}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-gray-800">
                              {[u.first_name, u.last_name].filter(Boolean).join(' ') || u.email}
                            </p>
                            <p className="text-xs text-gray-400">{u.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <Badge className={ROLE_COLORS[u.role] || 'bg-gray-100 text-gray-500'}>
                          {u.role === 'ADMIN' ? <><Shield size={10} /> Admin</> : 'Utilisateur'}
                        </Badge>
                      </td>
                      <td className="px-5 py-3.5 hidden md:table-cell">
                        <Badge className={STATUS_COLORS[u.status] || 'bg-gray-100 text-gray-400'}>
                          {u.status === 'active' ? 'Actif' : 'Inactif'}
                        </Badge>
                      </td>
                      <td className="px-5 py-3.5 hidden lg:table-cell text-xs text-gray-400">{fmtDateTime(u.created_at)}</td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center justify-end gap-1">
                          <button onClick={() => openEdit(u)}
                            className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors">
                            <Edit2 size={13} />
                          </button>
                          <button onClick={() => handleDelete(u.id)}
                            className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors">
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination pagination={pagination} onPage={setPage} />
          </>
        )}
      </div>

      <Modal open={showModal} onClose={() => setShowModal(false)}
        title={editing ? 'Modifier l\'utilisateur' : 'Nouvel utilisateur'}>
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input label="Prénom" placeholder="Jean"
              value={form.firstName} onChange={e => setForm(f => ({ ...f, firstName: e.target.value }))} />
            <Input label="Nom" placeholder="Dupont"
              value={form.lastName} onChange={e => setForm(f => ({ ...f, lastName: e.target.value }))} />
          </div>
          <Input label="Email *" type="email" required placeholder="jean@exemple.com"
            value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
          <Input label={editing ? 'Nouveau mot de passe (laisser vide pour ne pas changer)' : 'Mot de passe *'}
            type="password" required={!editing} placeholder="••••••••"
            value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} />
          <Select label="Rôle" value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))}>
            <option value="USER">Utilisateur</option>
            <option value="ADMIN">Administrateur</option>
          </Select>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" type="button" onClick={() => setShowModal(false)}>Annuler</Button>
            <Button type="submit" loading={saving}>{editing ? 'Mettre à jour' : 'Créer'}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
