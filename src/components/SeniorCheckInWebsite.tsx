import React, { useState, useEffect } from 'react';
import { CheckCircle2, AlertTriangle, Heart } from 'lucide-react';
import { Resident, CheckInStatus } from '../types';
import { api } from '../services/api';

interface SeniorCheckInWebsiteProps {
  initialResident?: Resident;
  allResidents?: Resident[];
  onCheckInStatus: (residentId: string, status: CheckInStatus) => void;
}

export function SeniorCheckInWebsite({
  initialResident,
  allResidents = [],
  onCheckInStatus,
}: SeniorCheckInWebsiteProps) {
  const [resident, setResident] = useState<Resident | null>(initialResident || null);
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [verificationBanner, setVerificationBanner] = useState<string | null>(null);
  const [errorBanner, setErrorBanner] = useState<string | null>(null);

  const currentStatus = resident?.status || 'awaiting';
  const isOk = currentStatus === 'ok';
  const isHelp = currentStatus === 'not_ok';

  const handleButtonTap = async (status: CheckInStatus) => {
    if (!resident) return;
    const timeFormatted = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const updated = { ...resident, status, checkInTime: timeFormatted } as Resident;
    setResident(updated);
    await api.recordCheckIn(resident.id, status, timeFormatted);
    onCheckInStatus(resident.id, status);
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('verify') || params.get('token');
    const residentId = params.get('residentId') || params.get('id');

    const run = async () => {
      if (token || residentId) {
        setIsVerifying(true);
        const res = await api.verifyDevice(token || undefined, residentId || undefined);
        setIsVerifying(false);

        if (res.success && res.resident) {
          setResident(res.resident);
          setVerificationBanner(`Device linked${res.home?.name ? ` to ${res.home.name}` : ''}.`);

          try {
            localStorage.setItem('elderwatch_linked_resident_id', res.resident.id);
            if (token) localStorage.setItem('elderwatch_linked_token', token);
          } catch {}

          const cleanUrl = window.location.pathname;
          window.history.replaceState({}, '', cleanUrl);
          return;
        }
        setErrorBanner(res.error || 'Verification link expired or invalid.');
      }

      try {
        const savedId = localStorage.getItem('elderwatch_linked_resident_id');
        const savedToken = localStorage.getItem('elderwatch_linked_token');
        const lookup = savedToken || savedId;
        if (lookup && !resident) {
          const profile = await api.getResidentProfile(lookup);
          if (profile?.resident) {
            setResident(profile.resident);
          }
        }
      } catch {}
    };

    run();
  }, []);

  return (
    <div className="fixed inset-0 z-50 bg-slate-950 text-white flex flex-col items-center justify-center p-6">
      {verificationBanner && (
        <div className="absolute top-4 left-4 right-4 bg-emerald-900/80 border border-emerald-500 text-emerald-200 p-4 rounded-2xl text-center text-sm font-semibold">
          {verificationBanner}
        </div>
      )}
      {errorBanner && (
        <div className="absolute top-4 left-4 right-4 bg-rose-900/80 border border-rose-500 text-rose-200 p-4 rounded-2xl text-center text-sm font-semibold">
          {errorBanner}
        </div>
      )}
      {isVerifying && (
        <div className="absolute top-4 left-4 right-4 bg-slate-800 p-4 rounded-2xl text-center text-sm text-slate-300 animate-pulse">
          Verifying device...
        </div>
      )}

      <div className="w-full max-w-lg space-y-8">
        <div className="text-center space-y-2">
          <p className="text-6xl font-black tracking-tight">
            {resident ? resident.name.split(' ')[0] : 'Resident'}
          </p>
          <p className="text-slate-400 text-base">
            {resident ? `${resident.room} · ${resident.wing}` : ''}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-5">
          <button
            id="resident-ok-button"
            type="button"
            onClick={() => handleButtonTap('ok')}
            className={`h-64 rounded-3xl text-white font-black text-3xl shadow-2xl transition-all active:scale-95 border-4 ${
              isOk
                ? 'bg-emerald-600 border-emerald-300 ring-4 ring-emerald-500/50'
                : 'bg-emerald-600 hover:bg-emerald-500 border-emerald-400 hover:scale-[1.02]'
            }`}
          >
            <div className="flex flex-col items-center justify-center gap-4">
              <CheckCircle2 className="w-20 h-20" />
              <span>I AM OK</span>
            </div>
          </button>

          <button
            id="resident-help-button"
            type="button"
            onClick={() => handleButtonTap('not_ok')}
            className={`h-64 rounded-3xl text-white font-black text-3xl shadow-2xl transition-all active:scale-95 border-4 ${
              isHelp
                ? 'bg-rose-700 border-rose-400 ring-4 ring-rose-500/50'
                : 'bg-rose-600 hover:bg-rose-500 border-rose-400 hover:scale-[1.02]'
            }`}
          >
            <div className="flex flex-col items-center justify-center gap-4">
              <AlertTriangle className="w-20 h-20" />
              <span>I NEED HELP</span>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
