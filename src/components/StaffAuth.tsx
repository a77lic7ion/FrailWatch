import React, { useState, useEffect } from 'react';
import { Shield, Mail, Lock, LogOut } from 'lucide-react';
import { auth, staffLogin, staffLogout, onStaffAuthChange } from '../services/staffAuth';

export const StaffLogin: React.FC<{ onLogin: (staff: any) => void }> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const unsub = onStaffAuthChange((user) => {
      if (user) onLogin(user);
    });
    return unsub;
  }, [onLogin]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const result = await staffLogin(email, password);
      onLogin(result.staff);
    } catch (err: any) {
      setError(err?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0b1118] text-[#e2e8f0] flex items-center justify-center px-4">
      <form onSubmit={submit} className="w-full max-w-sm rounded-3xl border border-[#223040] bg-[#0f1722] p-6 shadow-2xl">
        <h1 className="text-xl font-black mb-1">Staff login</h1>
        <p className="text-xs text-[#94a3b8] mb-4">Sign in with your staff email and password.</p>
        <div className="flex items-center gap-2 rounded-2xl border border-[#223040] bg-[#0b1118] px-3 py-3 mb-3">
          <Mail className="w-5 h-5 text-emerald-400" />
          <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" className="w-full bg-transparent text-[#e2e8f0] placeholder:text-[#94a3b8] focus:outline-none" />
        </div>
        <div className="flex items-center gap-2 rounded-2xl border border-[#223040] bg-[#0b1118] px-3 py-3 mb-4">
          <Lock className="w-5 h-5 text-emerald-400" />
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" className="w-full bg-transparent text-[#e2e8f0] placeholder:text-[#94a3b8] focus:outline-none" />
        </div>
        <button type="submit" disabled={loading} className="w-full rounded-2xl bg-emerald-600 py-3 font-bold">Sign in</button>
        {error && <p className="mt-3 text-xs text-rose-300">{error}</p>}
      </form>
    </div>
  );
};

export const StaffHeader: React.FC<{ staff: any; onLogout: () => void }> = ({ staff, onLogout }) => {
  return (
    <div className="flex items-center justify-between px-4 py-3 border-b border-[#223040] bg-[#0f1722]/60">
      <div>
        <div className="text-xs text-[#94a3b8] font-semibold">{staff.email}</div>
        <div className="text-[11px] text-[#94a3b8]">{staff.role === 'superadmin' ? 'Global admin' : `Home admin: ${staff.homeId}`}</div>
      </div>
      <button onClick={onLogout} className="px-3 py-2 rounded-xl border border-[#223040] text-xs font-semibold text-[#e2e8f0] hover:bg-[#131d27] transition flex items-center gap-1">
        <LogOut className="w-4 h-4" /> Sign out
      </button>
    </div>
  );
};
