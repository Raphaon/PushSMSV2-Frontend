'use client';
import { useState, useEffect, useCallback } from 'react';
import { Plus, List, Edit2, Trash2, Users, ChevronRight, X, UserPlus } from 'lucide-react';
import { contactListsApi, contactsApi, getErrMsg } from '@/lib/api';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import Pagination from '@/components/ui/Pagination';
import EmptyState from '@/components/ui/EmptyState';
import Input from '@/components/ui/Input';
import { fmtDateTime, fmtNumber } from '@/lib/utils';
import toast from 'react-hot-toast';

export default function ContactListsPage() {
  const [lists, setLists] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  // Create/Edit list modal
  const [showListModal, setShowListModal] = useState(false);
  const [editingList, setEditingList] = useState(null);
  const [listForm, setListForm] = useState({ name: '', description: '' });
  const [savingList, setSavingList] = useState(false);

  // Members panel
  const [selectedList, setSelectedList] = useState(null);
  const [members, setMembers] = useState([]);
  const [memberPage, setMemberPage] = useState(1);
  const [memberPagination, setMemberPagination] = useState(null);
  const [membersLoading, setMembersLoading] = useState(false);
  const [showAddMember, setShowAddMember] = useState(false);
  const [phoneInput, setPhoneInput] = useState('');
  const [addingMember, setAddingMember] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await contactListsApi.list({ page, limit: 15 });
      setLists(data.data || []);
      setPagination(data.pagination);
    } catch { /* */ }
    setLoading(false);
  }, [page]);

  useEffect(() => { load(); }, [load]);

  const loadMembers = useCallback(async () => {
    if (!selectedList) return;
    setMembersLoading(true);
    try {
      const { data } = await contactListsApi.getMembers(selectedList.id, { page: memberPage, limit: 20 });
      setMembers(data.data || []);
      setMemberPagination(data.pagination);
    } catch { /* */ }
    setMembersLoading(false);
  }, [selectedList, memberPage]);

  useEffect(() => { loadMembers(); }, [loadMembers]);

  const openCreate = () => { setEditingList(null); setListForm({ name: '', description: '' }); setShowListModal(true); };
  const openEdit = (l) => { setEditingList(l); setListForm({ name: l.name, description: l.description || '' }); setShowListModal(true); };

  const handleSaveList = async (e) => {
    e.preventDefault();
    setSavingList(true);
    try {
      if (editingList) {
        await contactListsApi.update(editingList.id, listForm);
        toast.success('Liste mise à jour');
        if (selectedList?.id === editingList.id) setSelectedList(s => ({ ...s, ...listForm }));
      } else {
        await contactListsApi.create(listForm);
        toast.success('Liste créée');
      }
      setShowListModal(false);
      load();
    } catch (err) { toast.error(getErrMsg(err)); }
    setSavingList(false);
  };

  const handleDeleteList = async (id) => {
    if (!confirm('Supprimer cette liste et tous ses membres ?')) return;
    try {
      await contactListsApi.delete(id);
      toast.success('Liste supprimée');
      if (selectedList?.id === id) setSelectedList(null);
      load();
    } catch (err) { toast.error(getErrMsg(err)); }
  };

  const handleAddMember = async (e) => {
    e.preventDefault();
    setAddingMember(true);
    try {
      await contactListsApi.addMember(selectedList.id, { phone: phoneInput });
      toast.success('Contact ajouté');
      setPhoneInput('');
      setShowAddMember(false);
      loadMembers();
      load();
    } catch (err) { toast.error(getErrMsg(err)); }
    setAddingMember(false);
  };

  const handleRemoveMember = async (contactId) => {
    if (!confirm('Retirer ce contact de la liste ?')) return;
    try {
      await contactListsApi.removeMember(selectedList.id, contactId);
      toast.success('Contact retiré');
      loadMembers();
      load();
    } catch (err) { toast.error(getErrMsg(err)); }
  };

  return (
    <div className="space-y-5 animate-fadeIn">
      <div className="flex items-center justify-between">
        <div />
        <Button onClick={openCreate}><Plus size={15} /> Nouvelle liste</Button>
      </div>

      <div className="grid lg:grid-cols-5 gap-5">
        {/* Lists panel */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          {loading ? (
            <div className="flex justify-center py-16">
              <svg className="animate-spin w-7 h-7 text-red-600" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="30 70" />
              </svg>
            </div>
          ) : lists.length === 0 ? (
            <EmptyState icon={List} title="Aucune liste"
              description="Créez votre première liste de contacts."
              action={<Button onClick={openCreate}><Plus size={14} /> Créer</Button>} />
          ) : (
            <>
              {lists.map(l => (
                <div key={l.id}
                  onClick={() => { setSelectedList(l); setMemberPage(1); }}
                  className={`flex items-center justify-between px-4 py-3.5 border-b border-gray-50 cursor-pointer transition-colors
                    ${selectedList?.id === l.id ? 'bg-red-50 border-l-2 border-l-red-500' : 'hover:bg-gray-50/40'}`}>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-gray-800 truncate">{l.name}</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      <Users size={10} className="inline mr-1" />{fmtNumber(l.member_count)} contacts
                    </p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0 ml-2">
                    <button onClick={e => { e.stopPropagation(); openEdit(l); }}
                      className="p-1.5 rounded-lg hover:bg-white text-gray-400 hover:text-gray-600 transition-colors">
                      <Edit2 size={12} />
                    </button>
                    <button onClick={e => { e.stopPropagation(); handleDeleteList(l.id); }}
                      className="p-1.5 rounded-lg hover:bg-white text-gray-400 hover:text-red-500 transition-colors">
                      <Trash2 size={12} />
                    </button>
                    <ChevronRight size={14} className="text-gray-300 ml-1" />
                  </div>
                </div>
              ))}
              <Pagination pagination={pagination} onPage={setPage} />
            </>
          )}
        </div>

        {/* Members panel */}
        <div className="lg:col-span-3 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          {!selectedList ? (
            <div className="flex flex-col items-center justify-center h-64 text-gray-400">
              <Users size={32} className="mb-3 opacity-30" />
              <p className="text-sm">Sélectionnez une liste pour voir ses membres</p>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                <div>
                  <h2 className="text-sm font-semibold text-gray-800">{selectedList.name}</h2>
                  <p className="text-xs text-gray-400">{fmtNumber(selectedList.member_count)} membres</p>
                </div>
                <Button size="sm" onClick={() => setShowAddMember(true)}>
                  <UserPlus size={13} /> Ajouter
                </Button>
              </div>
              {membersLoading ? (
                <div className="flex justify-center py-12">
                  <svg className="animate-spin w-6 h-6 text-red-600" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="30 70" />
                  </svg>
                </div>
              ) : members.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-10">Aucun membre dans cette liste</p>
              ) : (
                <>
                  <div className="divide-y divide-gray-50">
                    {members.map(m => (
                      <div key={m.contact_id} className="flex items-center justify-between px-5 py-3 hover:bg-gray-50/30">
                        <div className="flex items-center gap-3">
                          <div className="w-7 h-7 rounded-full bg-red-100 flex items-center justify-center text-xs font-bold text-red-600">
                            {(m.first_name?.[0] || m.phone?.[0] || '?').toUpperCase()}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-800">
                              {[m.first_name, m.last_name].filter(Boolean).join(' ') || m.phone}
                            </p>
                            <p className="text-xs text-gray-400">{m.phone}</p>
                          </div>
                        </div>
                        <button onClick={() => handleRemoveMember(m.contact_id)}
                          className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors">
                          <X size={13} />
                        </button>
                      </div>
                    ))}
                  </div>
                  <Pagination pagination={memberPagination} onPage={setMemberPage} />
                </>
              )}
            </>
          )}
        </div>
      </div>

      {/* Create/Edit list modal */}
      <Modal open={showListModal} onClose={() => setShowListModal(false)}
        title={editingList ? 'Modifier la liste' : 'Nouvelle liste'}>
        <form onSubmit={handleSaveList} className="space-y-4">
          <Input label="Nom de la liste *" placeholder="Clients VIP" required
            value={listForm.name} onChange={e => setListForm(f => ({ ...f, name: e.target.value }))} />
          <Input label="Description" placeholder="Description optionnelle"
            value={listForm.description} onChange={e => setListForm(f => ({ ...f, description: e.target.value }))} />
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" type="button" onClick={() => setShowListModal(false)}>Annuler</Button>
            <Button type="submit" loading={savingList}>{editingList ? 'Mettre à jour' : 'Créer'}</Button>
          </div>
        </form>
      </Modal>

      {/* Add member modal */}
      <Modal open={showAddMember} onClose={() => setShowAddMember(false)} title="Ajouter un contact">
        <form onSubmit={handleAddMember} className="space-y-4">
          <Input label="Numéro de téléphone *" placeholder="+237600000000" required
            value={phoneInput} onChange={e => setPhoneInput(e.target.value)} />
          <p className="text-xs text-gray-500">Le contact sera créé s'il n'existe pas encore.</p>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" type="button" onClick={() => setShowAddMember(false)}>Annuler</Button>
            <Button type="submit" loading={addingMember}>Ajouter</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
