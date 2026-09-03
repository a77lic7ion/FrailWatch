import React, { useState, useEffect } from 'react';
import { Phone, ShieldAlert } from 'lucide-react';
import { api } from '../services/api';

interface Props {
  onLoginSuccess?: (resident: any) => void;
  onBack?: () => void;
}

export const ResidentPhoneLogin: React.FC<Props> = ({ onLoginSuccess, onBack }) => {
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token') || params.get('verify');
    const residentId = params.get('residentId') || params.get('id');
    const lookup = token || residentId;
    if (!lookup) return;
    api.getResidentProfile(lookup).then((profile) => {
      if (profile?.resident) {
        api.verifyResident(lookup);
        onLoginSuccess?.(profile.resident);
      } else {
        setError('Resident link expired or invalid.');
      }
    }).catch(() => setError('Resident link expired or invalid.'));
  }, [onLoginSuccess]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const result = await api.phoneLogin(phone);
    if (result.success && result.resident) {
      onLoginSuccess?.(result.resident);
    } else {
      setError(result.error || 'Login failed');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center px-4">
      <form onSubmit={submit} className="w-full max-w-sm rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-2xl">
        <h1 className="text-xl font-black mb-1">Resident login</h1>
        <p className="text-xs text-slate-400 mb-4">Enter the cellphone number staff added for you.</p>
        <div className="flex items-center gap-2 rounded-2xl border border-slate-700 bg-slate-950 px-3 py-3">
          <Phone className="w-5 h-5 text-emerald-400" />
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="Cellphone number"
            inputMode="tel"
            className="w-full bg-transparent text-white placeholder:text-slate-500 focus:outline-none"
          />
        </div>
        <button type="submit" className="mt-4 w-full rounded-2xl bg-emerald-600 py-3 font-bold">Open my check-in</button>
        {onBack && (
          <button type="button" onClick={onBack} className="mt-3 w-full rounded-2xl border border-slate-700 py-2 text-xs font-semibold text-slate-300">Back</button>
        )}
        {error && (
          <div className="mt-3 flex items-start gap-2 rounded-xl border border-rose-700 bg-rose-950/80 p-3 text-xs text-rose-200">
            <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-rose-400" />
            <span>{error}</span>
          </div>
        )}
      </form>
    </div>
  );
};
