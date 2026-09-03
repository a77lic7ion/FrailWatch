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
  Share2,
  Copy,
  Check,
  Send,
  HelpCircle,
  Users
} from 'lucide-react';
import { Resident, CareHome, CheckInStatus } from '../types';
import { api } from '../services/api';

interface SeniorCheckInWebsiteProps {
  initialResident?: Resident;
  initialHome?: CareHome;
  allResidents?: Resident[];
  onCheckInStatus: (residentId: string, status: CheckInStatus) => void;
  onReturnToAdmin?: () => void;
}

export function SeniorCheckInWebsite({
  initialResident,
  initialHome,
  allResidents = [],
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
  const [showShareModal, setShowShareModal] = useState<boolean>(false);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);

  // Synthesize pleasant chime or alert tone & haptic vibration
  const triggerTactileFeedback = (isOk: boolean) => {
    // 1. Haptic vibration (on supported mobile devices)
    try {
      if (typeof window !== 'undefined' && 'navigator' in window && navigator.vibrate) {
        if (isOk) {
          navigator.vibrate(60);
        } else {
          navigator.vibrate([100, 50, 100]);
        }
      }
    } catch {
      // Ignore vibration errors
    }

    // 2. Tactile audio chime
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
        gain.gain.setValueAtTime(0.3, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
        osc.start();
        osc.stop(ctx.currentTime + 0.5);
      } else {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(350, ctx.currentTime);
        osc.frequency.setValueAtTime(220, ctx.currentTime + 0.2);
        gain.gain.setValueAtTime(0.35, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.65);
        osc.start();
        osc.stop(ctx.currentTime + 0.65);
      }
    } catch {
      // Audio autoplay might be blocked before first user gesture
    }
  };

  // Check URL query params for verification or resident on mount
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
          setErrorBanner(res.error || 'Verification link expired or invalid.');
        }
      }

      // Check localStorage for previously linked resident
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
    triggerTactileFeedback(status === 'ok');

    const timeFormatted = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    // Update local state immediately
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

  const currentResidentToken = resident?.verificationToken || (resident ? `ew_${resident.id}` : 'ew_demo');
  const checkInLink = `${window.location.origin}/?verify=${currentResidentToken}&home=${home?.id || 'home-benoni-01'}`;

  const copyShareLink = () => {
    navigator.clipboard.writeText(checkInLink);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const shareViaWhatsApp = () => {
    const text = encodeURIComponent(
      `Good morning ${resident?.name || 'Resident'}! Here is your morning check-in link for ${home?.name || 'Care Home'}. Tap this link before ${home?.cutoffTime || '09:15 AM'} to confirm you are safe: ${checkInLink}`
    );
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col justify-between selection:bg-emerald-500 selection:text-white pb-20 md:pb-6">
      
      {/* TOP MOBILE APP BAR */}
      <header className="bg-slate-950/90 border-b border-slate-800 backdrop-blur-md px-3.5 sm:px-4 py-2.5 sm:py-3 sticky top-0 z-30 shadow-md">
        <div className="max-w-md mx-auto flex items-center justify-between gap-2">
          
          <div className="flex items-center gap-2 min-w-0">
            <Building2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <div className="truncate">
              <p className="text-xs font-extrabold text-slate-100 truncate">
                {home?.name || 'Benoni Frail Care'}
              </p>
              <p className="text-[11px] text-slate-400">
                Cutoff: <span className="font-bold text-emerald-400">{home?.cutoffTime || '09:15'} AM</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {/* Share / Bookmark Link Button */}
            <button
              onClick={() => setShowShareModal(true)}
              className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-300 border border-slate-700 text-xs font-semibold flex items-center gap-1 transition"
              title="Share or Save Link"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Save Link</span>
            </button>

            {/* Audio Feedback Button */}
            <button
              onClick={() => setIsAudioEnabled(!isAudioEnabled)}
              className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition border border-slate-700"
              title={isAudioEnabled ? 'Audio chime on' : 'Audio chime muted'}
              aria-label="Toggle audio feedback"
            >
              <Volume2 className={`w-4 h-4 ${isAudioEnabled ? 'text-emerald-400' : 'text-slate-500'}`} />
            </button>
          </div>
        </div>
      </header>

      {/* MAIN CONTAINER (MOBILE CENTERED) */}
      <main className="flex-1 flex flex-col justify-center px-4 py-5 max-w-md mx-auto w-full space-y-4 sm:space-y-5">
        
        {/* Verification Success Toast */}
        {verificationBanner && (
          <div className="bg-emerald-950/90 border-2 border-emerald-500 text-emerald-200 p-3.5 rounded-2xl shadow-xl flex items-start gap-3 animate-in fade-in zoom-in-95">
            <Sparkles className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            <div className="text-xs">
              <h3 className="font-extrabold text-white text-xs">Device Linked to Room</h3>
              <p className="text-emerald-300 mt-0.5">{verificationBanner}</p>
            </div>
          </div>
        )}

        {/* Verification Error Toast */}
        {errorBanner && (
          <div className="bg-rose-950/90 border border-rose-600 text-rose-200 p-3.5 rounded-2xl flex items-start gap-3 text-xs">
            <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            <div>
              <h3 className="font-bold text-white text-xs">Notice</h3>
              <p className="text-rose-300 mt-0.5">{errorBanner}</p>
            </div>
          </div>
        )}

        {/* Loading indicator */}
        {isVerifying && (
          <div className="bg-slate-800 p-3.5 rounded-2xl text-center text-xs text-slate-300 animate-pulse">
            Connecting phone to care home...
          </div>
        )}

        {/* Resident Greeting Card */}
        <div className="bg-slate-800/90 border border-slate-700 rounded-3xl p-5 sm:p-6 shadow-xl text-center">
          <p className="text-xs font-bold text-emerald-400 uppercase tracking-widest mb-1">
            {formattedDate}
          </p>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Good morning, {resident ? resident.name.split(' ')[0] : 'Margaret'}!
          </h1>
          <p className="text-slate-300 text-xs sm:text-sm mt-1 font-medium">
            {resident ? `${resident.room} · ${resident.wing}` : 'Room 14 · Willow Cottage'}
          </p>

          <div className="mt-3.5 inline-flex items-center gap-1.5 bg-slate-900/80 px-3 py-1.5 rounded-full text-xs text-slate-300 border border-slate-700">
            <Heart className="w-3.5 h-3.5 text-rose-400 shrink-0" />
            <span>Assigned nurse: <strong className="text-white">{resident?.caregiver || 'Sr. Sarah Botha'}</strong></span>
          </div>

          {/* If previewing among multiple residents */}
          {allResidents.length > 1 && (
            <div className="mt-3 pt-2.5 border-t border-slate-700/60 flex items-center justify-center gap-1.5 text-[11px] text-slate-400">
              <span>Switch resident:</span>
              <select
                value={resident?.id || ''}
                onChange={(e) => {
                  const found = allResidents.find((r) => r.id === e.target.value);
                  if (found) setResident(found);
                }}
                className="bg-slate-900 text-emerald-300 rounded-lg px-2 py-1 text-[11px] font-semibold border border-slate-700 focus:outline-none"
              >
                {allResidents.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name} ({r.room})
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* RECENT ACTION NOTIFICATION */}
        {recentActionNotice && (
          <div className="bg-slate-800 border-2 border-emerald-500 text-emerald-300 px-4 py-3 rounded-2xl text-center text-xs font-bold shadow-lg animate-in fade-in">
            {recentActionNotice}
          </div>
        )}

        {/* PRIMARY YES / NO CHECK-IN BUTTONS (TOUCH-OPTIMIZED FOR MOBILES) */}
        <div className="space-y-3.5 sm:space-y-4">
          
          {/* BIG GREEN "I AM OK" (YES) BUTTON */}
          <button
            id="resident-ok-button"
            type="button"
            onClick={() => handleButtonTap('ok')}
            className={`w-full py-6 sm:py-7 px-5 rounded-3xl text-white font-black shadow-2xl transition-all active:scale-95 flex flex-col items-center justify-center gap-2 border-3 cursor-pointer ${
              isOk
                ? 'bg-emerald-600 border-emerald-300 ring-4 ring-emerald-500/50'
                : 'bg-emerald-600 hover:bg-emerald-500 border-emerald-400/90 hover:scale-[1.02]'
            }`}
            style={{ minHeight: '120px' }}
          >
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-9 h-9 sm:w-11 sm:h-11 text-white shrink-0" />
              <span className="text-3xl sm:text-4xl tracking-wide font-black">I AM OK</span>
            </div>
            <span className="text-emerald-100 text-xs sm:text-sm font-bold tracking-normal">
              {isOk ? `✓ Confirmed safe at ${resident?.checkInTime || '08:14 AM'}` : 'Tap here to let staff know you are safe'}
            </span>
          </button>

          {/* BIG RED "I NEED HELP" (NO) BUTTON */}
          <button
            id="resident-help-button"
            type="button"
            onClick={() => handleButtonTap('not_ok')}
            className={`w-full py-5 px-5 rounded-3xl text-white font-extrabold shadow-xl transition-all active:scale-95 flex flex-col items-center justify-center gap-1.5 border-2 cursor-pointer ${
              isHelp
                ? 'bg-rose-700 border-rose-400 ring-4 ring-rose-500/50'
                : 'bg-rose-600 hover:bg-rose-500 border-rose-400/80 hover:scale-[1.01]'
            }`}
            style={{ minHeight: '90px' }}
          >
            <div className="flex items-center gap-2.5">
              <AlertTriangle className="w-7 h-7 sm:w-8 sm:h-8 text-white shrink-0" />
              <span className="text-xl sm:text-2xl tracking-wide font-black">I NEED HELP</span>
            </div>
            <span className="text-rose-100 text-xs font-semibold">
              {isHelp ? '🚨 Alert dispatched to care staff' : 'Tap here if you feel unwell or need assistance'}
            </span>
          </button>
        </div>

        {/* STATUS SUMMARY & CONFIRMATION CARD */}
        {isOk && (
          <div className="bg-emerald-950/70 border border-emerald-700/80 rounded-2xl p-4 text-center text-xs text-emerald-200 animate-in fade-in">
            <p className="font-extrabold text-white text-sm">Have a wonderful morning!</p>
            <p className="mt-1 leading-relaxed">
              Your safety confirmation is recorded with care staff. Have breakfast and enjoy your day.
            </p>
            <button
              onClick={handleUndo}
              className="mt-2.5 inline-flex items-center gap-1 text-[11px] text-emerald-400 hover:text-emerald-300 underline font-semibold cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Tapped by mistake? Clear check-in</span>
            </button>
          </div>
        )}

        {isHelp && (
          <div className="bg-rose-950/90 border-2 border-rose-500 rounded-2xl p-4 text-center text-xs text-rose-200 animate-in fade-in">
            <p className="font-extrabold text-white text-sm">Care Staff Alerted</p>
            <p className="mt-1 leading-relaxed">
              Sister {resident?.caregiver || 'on duty'} has received an alert for {resident?.room || 'your room'}. Please sit or rest comfortably.
            </p>
            <button
              onClick={handleUndo}
              className="mt-2.5 inline-flex items-center gap-1 text-[11px] text-rose-300 hover:text-rose-200 underline font-semibold cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Tapped by mistake? Cancel help request</span>
            </button>
          </div>
        )}

        {/* 7-DAY REASSURANCE STRIP */}
        <div className="bg-slate-800/80 border border-slate-700/70 rounded-2xl p-3.5">
          <div className="flex items-center justify-between text-xs text-slate-400 font-semibold mb-2">
            <span>Past 7 Days Reassurance</span>
            <span className="text-emerald-400 font-bold">100% Peace of Mind</span>
          </div>
          <div className="grid grid-cols-7 gap-1 text-center">
            {['Fri', 'Sat', 'Sun', 'Mon', 'Tue', 'Wed', 'Today'].map((d, i) => {
              const isToday = i === 6;
              const todayOk = isToday && isOk;
              const todayHelp = isToday && isHelp;
              
              return (
                <div
                  key={d}
                  className={`p-1 sm:p-1.5 rounded-xl border flex flex-col items-center ${
                    todayOk || (!isToday && i < 6)
                      ? 'bg-emerald-950/70 border-emerald-700/80 text-emerald-300'
                      : todayHelp
                      ? 'bg-rose-950/70 border-rose-700/80 text-rose-300'
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

        {/* DIRECT CARE DESK CALL */}
        <div className="flex items-center justify-between bg-slate-800/60 border border-slate-700/60 rounded-2xl px-4 py-3 text-xs text-slate-400">
          <div>
            <p className="font-bold text-slate-200">Need to speak with nursing?</p>
            <p className="text-[11px] text-slate-400">Care desk line: +27 11 894 4000</p>
          </div>
          <a
            href="tel:+27118944000"
            className="py-2 px-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white transition flex items-center gap-1.5 font-bold text-xs shadow-sm"
          >
            <Phone className="w-3.5 h-3.5" />
            <span>Call</span>
          </a>
        </div>

      </main>

      {/* SHARE / SAVE LINK MODAL */}
      {showShareModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 text-white rounded-3xl p-5 max-w-sm w-full border border-slate-700 shadow-2xl space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between">
              <span className="font-extrabold text-sm text-white flex items-center gap-2">
                <Share2 className="w-4 h-4 text-emerald-400" />
                Resident Screen Link
              </span>
              <button
                onClick={() => setShowShareModal(false)}
                className="p-1 text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-300">
              Save this link or send it to {resident?.name || 'the resident'} so they can open this screen every morning:
            </p>

            <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800 text-[11px] font-mono text-emerald-300 break-all select-all">
              {checkInLink}
            </div>

            <div className="space-y-2">
              <button
                onClick={copyShareLink}
                className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs flex items-center justify-center gap-2 border border-slate-700 transition"
              >
                {copiedLink ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                <span>{copiedLink ? 'Copied to Clipboard!' : 'Copy Link'}</span>
              </button>

              <button
                onClick={shareViaWhatsApp}
                className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition"
              >
                <Send className="w-4 h-4" />
                <span>Send via WhatsApp</span>
              </button>
            </div>

            <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-400 space-y-1">
              <p className="font-bold text-slate-300">To save as 1-tap app icon:</p>
              <p>• <strong>iPhone:</strong> Tap Safari Share icon → "Add to Home Screen"</p>
              <p>• <strong>Android:</strong> Tap Chrome (⋮) → "Add to Home Screen"</p>
            </div>
          </div>
        </div>
      )}

      {/* FOOTER BAR (ON DESKTOP OR BACK TO ADMIN) */}
      <footer className="bg-slate-950/90 border-t border-slate-800 px-4 py-3 text-center text-xs text-slate-500">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <span className="text-[11px] text-slate-500">ElderWatch Senior Client</span>
          {onReturnToAdmin && (
            <button
              onClick={onReturnToAdmin}
              className="text-[11px] font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 underline cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Staff Triage</span>
            </button>
          )}
        </div>
      </footer>

    </div>
  );
}
