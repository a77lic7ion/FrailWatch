import React, { useState, useEffect } from 'react';
import { Shield, Plus, Users, X, UserPlus, Trash2 } from 'lucide-react';
import { getAuthHeaders } from '../services/api';
import { api } from '../services/api';

interface StaffManagementProps {
  isOpen: boolean;
  onClose: () => void;
  staff: any;
  onRefresh: () => Promise<void>;
}

interface StaffMember {
  uid: string;
  email: string;
  name?: string;
  role?: string;
  homeId?: string;
}

export function StaffManagement({ isOpen, onClose, staff, onRefresh }: StaffManagementProps) {
  const [staffList, setStaffList] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState('home_admin');
  const [homeId, setHomeId] = useState((staff?.homeId) || 'home-benoni-01');
  const [homes, setHomes] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [editingStaff, setEditingStaff] = useState<StaffMember | null>(null);

  const isCreatingGlobalAdmin = role === 'superadmin';

  const canGlobalManage = !!staff && (staff.role === 'superadmin' || staff.homeId === '*');

  const loadStaff = async () => {
    setLoading(true);
    try {
      const list = await api.getStaffList();
      setStaffList(list || []);
    } catch (e: any) {
      setError(e.message || 'Failed to load staff');
    } finally {
      setLoading(false);
    }
  };

  const loadHomes = async () => {
    try {
      const homes = await api.getHomes();
      setHomes(homes || []);
    } catch {}
  };

  useEffect(() => {
    if (isOpen) {
      loadStaff();
      loadHomes();
    }
  }, [isOpen]);

  const createStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      const data = await api.createStaff({ email, password, name, homeId, role });
      setSuccess(`Staff created: ${email}`);
      setEmail('');
      setPassword('');
      setName('');
      await loadStaff();
    } catch (e: any) {
      setError(e.message || 'Failed to create staff');
    } finally {
      setSaving(false);
    }
  };

  const saveEditingStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStaff) return;
    const updates: any = {};
    const form = e.target as HTMLFormElement;
    const nameInput = form.elements.namedItem('edit-staff-name') as HTMLInputElement | null;
    const roleInput = form.elements.namedItem('edit-staff-role') as HTMLSelectElement | null;
    const homeInput = form.elements.namedItem('edit-staff-home') as HTMLSelectElement | null;
    if (nameInput?.value) updates.name = nameInput.value;
    if (roleInput?.value) updates.role = roleInput.value;
    if (homeInput?.value) updates.homeId = homeInput.value;
    const ok = await api.updateStaff(editingStaff.uid, updates);
    if (ok) {
      setSuccess('Staff updated');
      await loadStaff();
      setEditingStaff(null);
    } else {
      setError('Failed to update staff');
    }
  };

  const removeStaff = async (uid: string) => {
    const ok = window.confirm('Remove this staff account?');
    if (!ok) return;
    const removed = await api.deleteStaff(uid);
    if (removed) {
      setSuccess('Staff removed');
      await loadStaff();
    } else {
      setError('Failed to remove staff');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#0f1722] rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-xl font-bold flex items-center gap-2"><Shield className="w-5 h-5" /> Staff Management</h2>
            <p className="text-xs text-[#94a3b8] mt-1">
              {canGlobalManage ? 'Add global admins or home-only admins.' : 'You can view home staff.'}
            </p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-[#141d27] rounded-lg"><X className="w-5 h-5" /></button>
        </div>

        <div className="p-6 space-y-6">
          {error && <p className="text-sm text-red-600">{error}</p>}
          {success && <p className="text-sm text-emerald-400">{success}</p>}

          {canGlobalManage && (
            <form onSubmit={createStaff} className="bg-[#0f1722] border border-[#1e293b] rounded-xl p-4 space-y-3">
              <div className="flex items-center gap-2 text-sm font-bold"><UserPlus className="w-4 h-4" /> Create Staff</div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input className="border rounded-lg p-2" placeholder="Full name" value={name} onChange={(e) => setName(e.target.value)} />
                <input className="border rounded-lg p-2" placeholder="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                <input className="border rounded-lg p-2" placeholder="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                <select className="border rounded-lg p-2" value={role} onChange={(e) => setRole(e.target.value)}>
                  <option value="superadmin">Global Admin</option>
                  <option value="home_admin">Home Admin</option>
                </select>
                {!isCreatingGlobalAdmin && (
                  <select className="border rounded-lg p-2" value={homeId} onChange={(e) => setHomeId(e.target.value)}>
                    {homes.map((h) => (
                      <option key={h.id} value={h.id}>{h.name}</option>
                    ))}
                  </select>
                )}
              </div>
              <button disabled={saving} className="bg-emerald-600 text-[#e2e8f0] px-4 py-2 rounded-lg text-sm font-bold disabled:opacity-60">
                {saving ? 'Creating...' : 'Create'}
              </button>
            </form>
          )}

          <div>
            <div className="flex items-center gap-2 text-sm font-bold mb-2"><Users className="w-4 h-4" /> Staff</div>
            {loading ? (
              <p className="text-xs text-[#94a3b8]">Loading...</p>
            ) : (
              <div className="space-y-2">
                {staffList.map((s) => (
                  <div key={s.uid} className="flex items-center justify-between border rounded-xl px-3 py-2">
                    <div>
                      <p className="text-sm font-semibold">{s.name || s.email}</p>
                      <p className="text-xs text-[#94a3b8]">{s.email} · {s.role || 'home_admin'} · {s.homeId}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {canGlobalManage && (
                        <>
                          <button onClick={() => setEditingStaff(s)} className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 underline">Edit</button>
                          <button onClick={() => removeStaff(s.uid)} className="text-xs font-semibold text-rose-400 hover:text-rose-900 underline flex items-center gap-1"><Trash2 className="w-3.5 h-3.5" /> Delete</button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
                {!staffList.length && <p className="text-xs text-[#94a3b8]">No staff found.</p>}
              </div>
            )}
          </div>

          {editingStaff && (
            <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="bg-[#0f1722] rounded-2xl shadow-2xl w-full max-w-lg">
                <div className="flex items-center justify-between p-6 border-b">
                  <div>
                    <h3 className="text-lg font-bold">Edit Staff</h3>
                    <p className="text-xs text-[#94a3b8]">{editingStaff.email}</p>
                  </div>
                  <button onClick={() => setEditingStaff(null)} className="p-2 hover:bg-[#141d27] rounded-lg"><X className="w-5 h-5" /></button>
                </div>
                <form onSubmit={saveEditingStaff} className="p-6 space-y-4">
                  <div>
                    <label className="text-xs font-bold text-[#e2e8f0] uppercase tracking-wider block mb-1">Name</label>
                    <input id="edit-staff-name" name="edit-staff-name" className="w-full px-3 py-2 text-xs rounded-xl border border-[#223040] bg-[#0f1722] text-[#e2e8f0]" defaultValue={editingStaff.name || ''} />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-bold text-[#e2e8f0] uppercase tracking-wider block mb-1">Role</label>
                      <select id="edit-staff-role" name="edit-staff-role" className="w-full px-3 py-2 text-xs rounded-xl border border-[#223040] bg-[#0f1722] text-[#e2e8f0]" defaultValue={editingStaff.role || 'home_admin'}>
                        <option value="superadmin">Global Admin</option>
                        <option value="home_admin">Home Admin</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-bold text-[#e2e8f0] uppercase tracking-wider block mb-1">Home</label>
                      <select id="edit-staff-home" name="edit-staff-home" className="w-full px-3 py-2 text-xs rounded-xl border border-[#223040] bg-[#0f1722] text-[#e2e8f0]" defaultValue={editingStaff.homeId || homeId}>
                        {homes.map((h) => (
                          <option key={h.id} value={h.id}>{h.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="flex gap-2 pt-2">
                    <button type="submit" className="flex-1 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-[#e2e8f0] font-bold text-xs transition">Save Changes</button>
                    <button type="button" onClick={() => setEditingStaff(null)} className="px-4 py-3 rounded-xl bg-[#141d27] hover:bg-[#141d27] text-[#e2e8f0] font-bold text-xs transition">Cancel</button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
