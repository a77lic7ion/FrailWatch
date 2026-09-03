import React, { useState, useEffect } from 'react';
import { CheckCircle2, AlertTriangle } from 'lucide-react';
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
        const res = await api.verifyDevice(token || undefined, residentId || undefined);
        if (res.success && res.resident) {
          setResident(res.resident);
          try {
            localStorage.setItem('elderwatch_linked_resident_id', res.resident.id);
            if (token) localStorage.setItem('elderwatch_linked_token', token);
          } catch {}
          const cleanUrl = window.location.pathname;
          window.history.replaceState({}, '', cleanUrl);
          return;
        }
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
    <div className="fixed inset-0 z-50 bg-slate-950 text-white flex items-center justify-center p-6">
      <div className="grid grid-cols-2 gap-6 w-full max-w-lg">
        <button
          id="resident-ok-button"
          type="button"
          onClick={() => handleButtonTap('ok')}
          className={`h-[70vh] rounded-3xl text-white font-black text-3xl shadow-2xl transition-all active:scale-95 border-4 ${
            isOk
              ? 'bg-emerald-600 border-emerald-300 ring-4 ring-emerald-500/50'
              : 'bg-emerald-600 hover:bg-emerald-500 border-emerald-400 hover:scale-[1.01]'
          }`}
        >
          <div className="flex flex-col items-center justify-center gap-4">
            <CheckCircle2 className="w-24 h-24" />
            <span>I AM OK</span>
          </div>
        </button>

        <button
          id="resident-help-button"
          type="button"
          onClick={() => handleButtonTap('not_ok')}
          className={`h-[70vh] rounded-3xl text-white font-black text-3xl shadow-2xl transition-all active:scale-95 border-4 ${
            isHelp
              ? 'bg-rose-700 border-rose-400 ring-4 ring-rose-500/50'
              : 'bg-rose-600 hover:bg-rose-500 border-rose-400 hover:scale-[1.01]'
          }`}
        >
          <div className="flex flex-col items-center justify-center gap-4">
            <AlertTriangle className="w-24 h-24" />
            <span>I NEED HELP</span>
          </div>
        </button>
      </div>
    </div>
  );
}
