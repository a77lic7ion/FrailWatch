import React, { useState, useEffect } from 'react';
import { Shield, Plus, Users, X, UserPlus } from 'lucide-react';
import { getAuthHeaders } from '../services/api';

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
  const [homeId, setHomeId] = useState(staff.homeId || 'home-benoni-01');
  const [homes, setHomes] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const canGlobalManage = staff.role === 'superadmin' || staff.homeId === '*';

  const loadStaff = async () => {
    setLoading(true);
    try {
      const headers = await getAuthHeaders();
      const res = await fetch('/api/staff', { headers });
      if (res.ok) {
        const data = await res.json();
        setStaffList(data.staff || []);
      }
    } catch (e: any) {
      setError(e.message || 'Failed to load staff');
    } finally {
      setLoading(false);
    }
  };

  const loadHomes = async () => {
    try {
      const headers = await getAuthHeaders();
      const res = await fetch('/api/homes', { headers });
      if (res.ok) {
        const data = await res.json();
        setHomes(data.homes || []);
      }
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
      const headers = await getAuthHeaders();
      const res = await fetch('/api/staff', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...headers },
        body: JSON.stringify({ email, password, name, homeId, role }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create staff');
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-xl font-bold flex items-center gap-2"><Shield className="w-5 h-5" /> Staff Management</h2>
            <p className="text-xs text-slate-500 mt-1">
              {canGlobalManage ? 'Add global admins or home-only admins.' : 'You can view home staff.'}
            </p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg"><X className="w-5 h-5" /></button>
        </div>

        <div className="p-6 space-y-6">
          {error && <p className="text-sm text-red-600">{error}</p>}
          {success && <p className="text-sm text-emerald-700">{success}</p>}

          {canGlobalManage && (
            <form onSubmit={createStaff} className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
              <div className="flex items-center gap-2 text-sm font-bold"><UserPlus className="w-4 h-4" /> Create Staff</div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input className="border rounded-lg p-2" placeholder="Full name" value={name} onChange={(e) => setName(e.target.value)} />
                <input className="border rounded-lg p-2" placeholder="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                <input className="border rounded-lg p-2" placeholder="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                <select className="border rounded-lg p-2" value={role} onChange={(e) => setRole(e.target.value)}>
                  <option value="superadmin">Global Admin</option>
                  <option value="home_admin">Home Admin</option>
                </select>
                <select className="border rounded-lg p-2" value={homeId} onChange={(e) => setHomeId(e.target.value)}>
                  {homes.map((h) => (
                    <option key={h.id} value={h.id}>{h.name}</option>
                  ))}
                </select>
              </div>
              <button disabled={saving} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-bold disabled:opacity-60">
                {saving ? 'Creating...' : 'Create'}
              </button>
            </form>
          )}

          <div>
            <div className="flex items-center gap-2 text-sm font-bold mb-2"><Users className="w-4 h-4" /> Staff</div>
            {loading ? (
              <p className="text-xs text-slate-500">Loading...</p>
            ) : (
              <div className="space-y-2">
                {staffList.map((s) => (
                  <div key={s.uid} className="flex items-center justify-between border rounded-xl px-3 py-2">
                    <div>
                      <p className="text-sm font-semibold">{s.name || s.email}</p>
                      <p className="text-xs text-slate-500">{s.email} · {s.role || 'home_admin'} · {s.homeId}</p>
                    </div>
                  </div>
                ))}
                {!staffList.length && <p className="text-xs text-slate-500">No staff found.</p>}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
