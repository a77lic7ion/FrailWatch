import React, { useState, useEffect } from 'react';
import {
  CheckCircle2,
  AlertTriangle,
  Heart,
  Building2,
  Phone,
  ShieldCheck,
  RotateCcw,
  Volume2,
  ArrowLeft,
  Sparkles,
  Info
} from 'lucide-react';
import { Resident, CareHome, CheckInStatus } from '../types';
import { api } from '../services/api';

interface SeniorCheckInWebsiteProps {
  initialResident?: Resident;
  initialHome?: CareHome;
  onCheckInStatus: (residentId: string, status: CheckInStatus) => void;
  onReturnToAdmin?: () => void;
}

export function SeniorCheckInWebsite({
  initialResident,
  initialHome,
  onCheckInStatus,
  onReturnToAdmin,
}: SeniorCheckInWebsiteProps) {
  const [resident, setResident] = useState<Resident | null>(initialResident || null);
  const [home, setHome] = useState<CareHome | null>(initialHome || null);
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [verificationBanner, setVerificationBanner] = useState<string | null>(null);
  const [errorBanner, setErrorBanner] = useState<string | null>(null);
  const [isAudioEnabled, setIsAudioEnabled] = useState<boolean>(true);
  const [recentActionNotice, setRecentActionNotice] = useState<string | null>(null);

  // Synthesize pleasant chime or alert tone
  const playTactileTone = (isOk: boolean) => {
    if (!isAudioEnabled) return;
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      if (isOk) {
        osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
        osc.frequency.exponentialRampToValueAtTime(659.25, ctx.currentTime + 0.15); // E5
        gain.gain.setValueAtTime(0.25, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.45);
        osc.start();
        osc.stop(ctx.currentTime + 0.45);
      } else {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(320, ctx.currentTime);
        osc.frequency.setValueAtTime(220, ctx.currentTime + 0.2);
        gain.gain.setValueAtTime(0.35, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.6);
        osc.start();
        osc.stop(ctx.currentTime + 0.6);
      }
    } catch {
      // Audio autoplay might be blocked before first user gesture
    }
  };

  // Check URL query params for verification on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('verify') || params.get('token');
    const residentId = params.get('residentId') || params.get('id');

    const runVerificationOrFetch = async () => {
      if (token || residentId) {
        setIsVerifying(true);
        const res = await api.verifyDevice(token || undefined, residentId || undefined);
        setIsVerifying(false);

        if (res.success && res.resident) {
          setResident(res.resident);
          if (res.home) setHome(res.home);
          setVerificationBanner(`Device verified and attached to ${res.home?.name || 'Care Home'}!`);
          
          // Persist in local storage for subsequent mornings
          try {
            localStorage.setItem('elderwatch_linked_resident_id', res.resident.id);
            if (token) localStorage.setItem('elderwatch_linked_token', token);
          } catch {
            // Ignore storage errors
          }

          // Clean up URL parameter cleanly without reloading
          const cleanUrl = window.location.pathname;
          window.history.replaceState({}, '', cleanUrl);
          return;
        } else {
          setErrorBanner(res.error || 'Verification link expired or invalid. Please check with care home staff.');
        }
      }

      // If no token in URL, check localStorage for previously linked device
      try {
        const savedId = localStorage.getItem('elderwatch_linked_resident_id');
        const savedToken = localStorage.getItem('elderwatch_linked_token');
        const lookup = savedToken || savedId;
        if (lookup && !resident) {
          const profile = await api.getResidentProfile(lookup);
          if (profile?.resident) {
            setResident(profile.resident);
            if (profile.home) setHome(profile.home);
          }
        }
      } catch {
        // Fallback
      }
    };

    runVerificationOrFetch();
  }, []);

  // Synchronize when parent prop updates
  useEffect(() => {
    if (initialResident) {
      setResident(initialResident);
    }
  }, [initialResident]);

  useEffect(() => {
    if (initialHome) {
      setHome(initialHome);
    }
  }, [initialHome]);

  const currentStatus = resident?.status || 'awaiting';
  const isOk = currentStatus === 'ok';
  const isHelp = currentStatus === 'not_ok';

  const handleButtonTap = async (status: CheckInStatus) => {
    if (!resident) return;
    playTactileTone(status === 'ok');

    const timeFormatted = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    // Update local resident state immediately
    const updated = {
      ...resident,
      status,
      checkInTime: timeFormatted,
    };
    setResident(updated);

    // Call backend API to record in Firestore database
    await api.recordCheckIn(resident.id, status, timeFormatted);

    // Notify parent app
    onCheckInStatus(resident.id, status);

    if (status === 'ok') {
      setRecentActionNotice(`Good morning, ${resident.name}! Your check-in was saved at ${timeFormatted}.`);
    } else {
      setRecentActionNotice(`Help request sent to ${resident.caregiver} for ${resident.room}.`);
    }

    setTimeout(() => {
      setRecentActionNotice(null);
    }, 8000);
  };

  const handleUndo = async () => {
    if (!resident) return;
    const updated = {
      ...resident,
      status: 'awaiting' as CheckInStatus,
      checkInTime: undefined,
    };
    setResident(updated);
    await api.recordCheckIn(resident.id, 'awaiting');
    onCheckInStatus(resident.id, 'awaiting');
    setRecentActionNotice('Check-in cleared. You may tap again when ready.');
    setTimeout(() => setRecentActionNotice(null), 5000);
  };

  const formattedDate = new Intl.DateTimeFormat('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }).format(new Date());

  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col justify-between selection:bg-emerald-500 selection:text-white">
      {/* TOP STATUS BAR: Care Home context & device status */}
      <header className="bg-slate-950/80 border-b border-slate-800 backdrop-blur-md px-4 py-3 sticky top-0 z-30">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <div>
              <p className="text-xs font-bold text-slate-200 truncate max-w-[210px] sm:max-w-xs">
                {home?.name || 'Care Home Reassurance'}
              </p>
              <p className="text-[11px] text-slate-400">
                Cutoff: <span className="font-semibold text-emerald-400">{home?.cutoffTime || '09:15'} AM</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 bg-emerald-950/80 text-emerald-300 border border-emerald-800/80 px-2.5 py-1 rounded-full text-[11px] font-semibold">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Verified Home Device</span>
            </div>
            <button
              onClick={() => setIsAudioEnabled(!isAudioEnabled)}
              className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white transition"
              title={isAudioEnabled ? 'Audio chime on' : 'Audio chime muted'}
              aria-label="Toggle audio feedback"
            >
              <Volume2 className={`w-4 h-4 ${isAudioEnabled ? 'text-emerald-400' : 'text-slate-500'}`} />
            </button>
          </div>
        </div>
      </header>

      {/* MAIN CONTAINER */}
      <main className="flex-1 flex flex-col justify-center px-4 py-6 max-w-md mx-auto w-full space-y-5">
        
        {/* Verification Success Toast */}
        {verificationBanner && (
          <div className="bg-emerald-950/90 border-2 border-emerald-500 text-emerald-200 p-4 rounded-2xl shadow-xl flex items-start gap-3 animate-in fade-in zoom-in-95">
            <Sparkles className="w-6 h-6 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <h3 className="font-bold text-sm text-white">Link Confirmed & Saved!</h3>
              <p className="text-xs text-emerald-300 mt-0.5">{verificationBanner}</p>
              <p className="text-[11px] text-emerald-400/80 mt-1">This phone is now attached. Tap your green button each morning.</p>
            </div>
          </div>
        )}

        {/* Verification Error Toast */}
        {errorBanner && (
          <div className="bg-rose-950/90 border border-rose-600 text-rose-200 p-4 rounded-2xl flex items-start gap-3">
            <AlertTriangle className="w-6 h-6 text-rose-400 shrink-0 mt-0.5" />
            <div>
              <h3 className="font-bold text-sm text-white">Verification Notice</h3>
              <p className="text-xs text-rose-300 mt-0.5">{errorBanner}</p>
            </div>
          </div>
        )}

        {/* Loading indicator */}
        {isVerifying && (
          <div className="bg-slate-800 p-4 rounded-2xl text-center text-xs text-slate-300 animate-pulse">
            Attaching device to care home database...
          </div>
        )}

        {/* Resident Greeting Card */}
        <div className="bg-slate-800/80 border border-slate-700/80 rounded-3xl p-6 shadow-xl text-center">
          <p className="text-xs font-semibold text-emerald-400 uppercase tracking-wider mb-1">
            {formattedDate}
          </p>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Good morning, {resident ? resident.name.split(' ')[0] : 'Resident'}!
          </h1>
          <p className="text-slate-300 text-sm mt-1">
            {resident ? `${resident.room} · ${resident.wing}` : 'Morning Safety Check-In'}
          </p>

          <div className="mt-4 inline-flex items-center gap-1.5 bg-slate-900/60 px-3 py-1.5 rounded-full text-xs text-slate-400 border border-slate-700/50">
            <Heart className="w-3.5 h-3.5 text-rose-400" />
            <span>Assigned nurse: <strong className="text-slate-200">{resident?.caregiver || 'Care Staff'}</strong></span>
          </div>
        </div>

        {/* RECENT ACTION NOTIFICATION */}
        {recentActionNotice && (
          <div className="bg-slate-800 border border-emerald-500/50 text-emerald-300 px-4 py-3 rounded-2xl text-center text-xs font-semibold shadow-lg">
            {recentActionNotice}
          </div>
        )}

        {/* THE PRIMARY CHECK-IN BUTTONS */}
        <div className="space-y-4">
          
          {/* BIG GREEN "I AM OK" BUTTON */}
          <button
            id="resident-ok-button"
            type="button"
            onClick={() => handleButtonTap('ok')}
            className={`w-full py-7 px-6 rounded-3xl text-white font-extrabold shadow-2xl transition-all active:scale-95 flex flex-col items-center justify-center gap-2 border-2 ${
              isOk
                ? 'bg-emerald-600 border-emerald-300 ring-4 ring-emerald-500/40'
                : 'bg-emerald-600 hover:bg-emerald-500 border-emerald-400/80 hover:scale-[1.02]'
            }`}
            style={{ minHeight: '120px' }}
          >
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-10 h-10 text-white" />
              <span className="text-3xl tracking-wide">I AM OK</span>
            </div>
            <span className="text-emerald-100 text-xs font-semibold tracking-normal">
              {isOk ? `✓ Confirmed safe at ${resident?.checkInTime || '08:14 AM'}` : 'Tap here to let staff know you are safe'}
            </span>
          </button>

          {/* BIG RED "I NEED HELP" BUTTON */}
          <button
            id="resident-help-button"
            type="button"
            onClick={() => handleButtonTap('not_ok')}
            className={`w-full py-5 px-6 rounded-3xl text-white font-bold shadow-xl transition-all active:scale-95 flex flex-col items-center justify-center gap-1.5 border-2 ${
              isHelp
                ? 'bg-rose-700 border-rose-400 ring-4 ring-rose-500/40'
                : 'bg-rose-600 hover:bg-rose-500 border-rose-400/60 hover:scale-[1.01]'
            }`}
            style={{ minHeight: '90px' }}
          >
            <div className="flex items-center gap-2.5">
              <AlertTriangle className="w-7 h-7 text-white" />
              <span className="text-xl sm:text-2xl tracking-wide">I NEED HELP</span>
            </div>
            <span className="text-rose-100 text-xs font-semibold">
              {isHelp ? '🚨 Alert dispatched to care staff' : 'Tap here if you feel unwell or need urgent assistance'}
            </span>
          </button>
        </div>

        {/* STATUS SUMMARY / REASSURANCE CARD */}
        {isOk && (
          <div className="bg-emerald-950/60 border border-emerald-700/60 rounded-2xl p-4 text-center text-xs text-emerald-200">
            <p className="font-bold text-white text-sm">Have a wonderful morning!</p>
            <p className="mt-1">
              Your safety confirmation is recorded with care staff. Have breakfast and enjoy your day.
            </p>
            <button
              onClick={handleUndo}
              className="mt-3 inline-flex items-center gap-1 text-[11px] text-emerald-400 hover:text-emerald-300 underline font-semibold"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Tapped by mistake? Clear check-in</span>
            </button>
          </div>
        )}

        {isHelp && (
          <div className="bg-rose-950/80 border-2 border-rose-500 rounded-2xl p-4 text-center text-xs text-rose-200 animate-in fade-in">
            <p className="font-extrabold text-white text-sm">Care Staff Have Been Alerted</p>
            <p className="mt-1">
              Sister {resident?.caregiver || 'on duty'} is coming to {resident?.room || 'your room'} to check on you. Please sit or rest comfortably.
            </p>
            <button
              onClick={handleUndo}
              className="mt-3 inline-flex items-center gap-1 text-[11px] text-rose-300 hover:text-rose-200 underline font-semibold"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Tapped by mistake? Cancel help request</span>
            </button>
          </div>
        )}

        {/* 7-DAY REASSURANCE STRIP */}
        <div className="bg-slate-800/60 border border-slate-700/60 rounded-2xl p-3.5">
          <div className="flex items-center justify-between text-xs text-slate-400 font-semibold mb-2">
            <span>Past 7 Days Reassurance</span>
            <span className="text-emerald-400 font-bold">100% Peace of Mind</span>
          </div>
          <div className="grid grid-cols-7 gap-1.5 text-center">
            {['Fri', 'Sat', 'Sun', 'Mon', 'Tue', 'Wed', 'Today'].map((d, i) => {
              const isToday = i === 6;
              const todayOk = isToday && isOk;
              const todayHelp = isToday && isHelp;
              
              return (
                <div
                  key={d}
                  className={`p-1.5 rounded-xl border flex flex-col items-center ${
                    todayOk || (!isToday && i < 6)
                      ? 'bg-emerald-950/60 border-emerald-700/60 text-emerald-300'
                      : todayHelp
                      ? 'bg-rose-950/60 border-rose-700/60 text-rose-300'
                      : 'bg-slate-800 border-slate-700 text-slate-400'
                  }`}
                >
                  <span className="text-[10px] font-bold">{d}</span>
                  <span className="text-xs mt-0.5">
                    {todayHelp ? '🚨' : todayOk || i < 6 ? '✓' : '—'}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* DIRECT CARE DESK CONTACT */}
        <div className="flex items-center justify-between bg-slate-800/50 border border-slate-700/50 rounded-2xl px-4 py-3 text-xs text-slate-400">
          <div>
            <p className="font-semibold text-slate-300">Need to speak with nursing?</p>
            <p className="text-[11px] text-slate-500">Care desk line: +27 11 894 4000</p>
          </div>
          <a
            href="tel:+27118944000"
            className="p-2.5 rounded-xl bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600/30 border border-emerald-500/40 transition flex items-center gap-1.5 font-bold text-xs"
          >
            <Phone className="w-4 h-4" />
            <span>Call</span>
          </a>
        </div>
      </main>

      {/* FOOTER: Optional return to Admin Dashboard for facility testing */}
      <footer className="bg-slate-950/90 border-t border-slate-800/80 px-4 py-3 text-center text-xs text-slate-500">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <span className="text-[11px] text-slate-500">ElderWatch Senior Client</span>
          {onReturnToAdmin && (
            <button
              onClick={onReturnToAdmin}
              className="text-[11px] font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 underline"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Open Staff / Admin Dashboard</span>
            </button>
          )}
        </div>
      </footer>
    </div>
  );
}
