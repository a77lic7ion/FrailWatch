import React, { useState } from 'react';
import { 
  CheckCircle2, 
  AlertTriangle, 
  PhoneCall, 
  Volume2, 
  RotateCcw, 
  Maximize2, 
  Minimize2, 
  QrCode, 
  ShieldAlert, 
  HeartHandshake, 
  Eye, 
  Smartphone,
  Check,
  LifeBuoy
} from 'lucide-react';
import { Resident, CheckInStatus } from '../types';
import { Logo } from './Logo';

interface ResidentPhoneViewProps {
  residents: Resident[];
  activeResidentId: string;
  setActiveResidentId: (id: string) => void;
  onCheckIn: (residentId: string, status: CheckInStatus) => void;
  cutoffTime: string;
}

export const ResidentPhoneView: React.FC<ResidentPhoneViewProps> = ({
  residents,
  activeResidentId,
  setActiveResidentId,
  onCheckIn,
  cutoffTime,
}) => {
  const [isLargeText, setIsLargeText] = useState(false);
  const [isHighContrast, setIsHighContrast] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [showUndoNotice, setShowUndoNotice] = useState(false);
  const [showPairModal, setShowPairModal] = useState(false);

  const fallbackResident: Resident = {
    id: 'res-1',
    name: 'Resident',
    room: 'Room 1',
    wing: 'Willow Cottage',
    phone: '+27 82 455 1092',
    deviceLinked: true,
    status: 'awaiting',
    caregiver: 'Sr. Sarah Botha',
    medicalAlerts: [],
    notes: '',
    emergencyContact: {
      name: 'Family Contact',
      relationship: 'Family',
      phone: '+27 83 291 0044',
      notifyOnIssue: true,
    },
    sevenDayHistory: [],
  };

  const resident = residents.find((r) => r.id === activeResidentId) || residents[0] || fallbackResident;

  // Web Audio synthesizer tone for tactile feedback
  const playTone = (isOk: boolean) => {
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
        gain.gain.setValueAtTime(0.2, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
        osc.start();
        osc.stop(ctx.currentTime + 0.4);
      } else {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(300, ctx.currentTime);
        osc.frequency.setValueAtTime(200, ctx.currentTime + 0.2);
        gain.gain.setValueAtTime(0.3, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
        osc.start();
        osc.stop(ctx.currentTime + 0.5);
      }
    } catch {
      // Audio context might be restricted before user gesture
    }
  };

  const handleTap = (status: CheckInStatus) => {
    playTone(status === 'ok');
    onCheckIn(resident.id, status);
    setShowUndoNotice(true);
    setTimeout(() => {
      setShowUndoNotice(false);
    }, 8000);
  };

  const handleUndo = () => {
    onCheckIn(resident.id, 'awaiting');
    setShowUndoNotice(false);
  };

  const todayDateFormatted = new Intl.DateTimeFormat('en-GB', {
    weekday: 'long',
    month: 'short',
    day: 'numeric'
  }).format(new Date());

  return (
    <div className="py-6 px-4 max-w-5xl mx-auto">
      {/* Top Explanation & Control Ribbon */}
      <div className="mb-6 bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200">
              Elderly Ergonomics Design
            </span>
            <span className="text-xs text-slate-500 font-medium">Cutoff: {cutoffTime} AM</span>
          </div>
          <h2 className="text-lg font-bold text-slate-900 mt-1">
            Resident Phone Interface ({resident.name})
          </h2>
          <p className="text-xs text-slate-500 max-w-xl">
            Zero logins. Zero passwords. No menus or typing. Designed specifically for tremors, low vision, and zero smartphone complexity.
          </p>
        </div>

        {/* Device simulation controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Switch active resident */}
          <div className="flex items-center gap-1.5 text-xs bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200">
            <span className="text-slate-500">Resident:</span>
            <select
              id="switch-resident-select"
              aria-label="Switch Active Resident for Testing"
              value={activeResidentId}
              onChange={(e) => setActiveResidentId(e.target.value)}
              className="bg-transparent font-bold text-slate-800 focus:outline-none cursor-pointer"
            >
              {residents.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name} ({r.room})
                </option>
              ))}
            </select>
          </div>

          {/* Accessibility toggles */}
          <button
            id="toggle-large-text-btn"
            onClick={() => setIsLargeText(!isLargeText)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition flex items-center gap-1 ${
              isLargeText 
                ? 'bg-amber-100 text-amber-900 border-amber-300' 
                : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
            }`}
            title="Toggle Extra Large Vision Mode"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>{isLargeText ? 'Font: XL' : 'Font: Normal'}</span>
          </button>

          <button
            id="toggle-contrast-btn"
            onClick={() => setIsHighContrast(!isHighContrast)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition flex items-center gap-1 ${
              isHighContrast 
                ? 'bg-slate-900 text-white border-slate-950' 
                : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
            }`}
            title="Toggle High Contrast Vision Mode"
          >
            <Volume2 className="w-3.5 h-3.5" />
            <span>{isHighContrast ? 'Contrast: High' : 'Contrast: Soft'}</span>
          </button>

          {/* Fullscreen simulator toggle */}
          <button
            id="toggle-fullscreen-phone-btn"
            onClick={() => setIsFullScreen(!isFullScreen)}
            className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-white transition flex items-center gap-1 shadow-sm"
          >
            {isFullScreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
            <span>{isFullScreen ? 'Exit Fullscreen' : 'View Fullscreen'}</span>
          </button>

          <button
            id="show-pairing-btn"
            onClick={() => setShowPairModal(true)}
            className="p-1.5 rounded-xl text-slate-600 bg-slate-100 hover:bg-slate-200 border border-slate-200 transition"
            title="Show 1-Tap Device Link & QR"
          >
            <QrCode className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* The Smartphone Frame Container */}
      <div className={`flex justify-center transition-all duration-300 ${
        isFullScreen 
          ? 'fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md p-2 sm:p-6 overflow-y-auto' 
          : 'relative'
      }`}>
        <div className={`w-full max-w-[420px] rounded-3xl sm:rounded-[44px] p-2 sm:p-3 transition-all duration-300 ${
          isHighContrast ? 'bg-black border-2 sm:border-4 border-slate-700' : 'bg-slate-900 border-4 sm:border-[10px] border-slate-800 shadow-2xl'
        } relative flex flex-col min-h-[660px] sm:min-h-[720px] max-h-[880px]`}>
          
          {/* Close button in fullscreen */}
          {isFullScreen && (
            <button
              onClick={() => setIsFullScreen(false)}
              className="absolute -top-3 -right-3 z-50 p-2.5 rounded-full bg-slate-800 text-white hover:bg-slate-700 shadow-xl border border-slate-600"
              title="Close Fullscreen"
            >
              <Minimize2 className="w-5 h-5" />
            </button>
          )}

          {/* Phone Speaker Notch & Hardware Island */}
          <div className="w-full flex justify-center pt-2 pb-3">
            <div className="w-24 h-4 rounded-full bg-slate-950 flex items-center justify-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-slate-800"></div>
              <div className="w-10 h-1.5 rounded-full bg-slate-800"></div>
            </div>
          </div>

          {/* Inner Phone Screen */}
          <div className={`flex-1 rounded-[32px] overflow-hidden flex flex-col relative ${
            isHighContrast ? 'bg-slate-950 text-white' : 'bg-slate-900 text-slate-100'
          }`}>
            
            {/* Top Status & Morning Header */}
            <div className="px-5 pt-4 pb-3 border-b border-slate-800/80 bg-slate-900/60 flex items-center justify-between text-slate-400 text-xs">
              <div className="flex items-center gap-2">
                <Logo className="w-5 h-5" />
                <span className="font-bold text-slate-200 text-xs tracking-tight">ElderWatch</span>
              </div>
              <div className="flex items-center gap-1.5 text-[11px] font-medium text-emerald-400">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>Active Reassurance</span>
              </div>
            </div>

            {/* Resident Personalized Welcome Banner */}
            <div className="px-5 py-4 text-center bg-slate-900 border-b border-slate-800/80">
              <p className="text-xs uppercase font-bold tracking-widest text-slate-400">
                {todayDateFormatted}
              </p>
              <h1 className={`font-extrabold tracking-tight text-slate-100 mt-0.5 ${
                isLargeText ? 'text-3xl' : 'text-2xl'
              }`}>
                Good morning, {resident.name.split(' ')[0]}
              </h1>
              <p className="text-xs text-slate-400 mt-1">
                {resident.room} · Please tap your morning check-in
              </p>
            </div>

            {/* Undo Notification Bar */}
            {showUndoNotice && (
              <div className="bg-amber-500/90 text-slate-950 px-4 py-2 text-xs font-bold flex items-center justify-between shadow-md animate-in slide-in-from-top duration-200">
                <span>Response recorded! Tapped by mistake?</span>
                <button
                  id="undo-tap-btn"
                  onClick={handleUndo}
                  className="px-2.5 py-1 rounded bg-slate-950 text-white hover:bg-slate-800 transition flex items-center gap-1"
                >
                  <RotateCcw className="w-3 h-3" />
                  Undo
                </button>
              </div>
            )}

            {/* Active Content: Either The Two Giant Buttons OR The Confirmation Card */}
            <div className="flex-1 p-4 flex flex-col justify-center gap-4">
              {resident.status === 'awaiting' ? (
                // THE TWO GIANT BUTTONS
                <div className="flex-1 flex flex-col gap-4 justify-center">
                  
                  {/* GREEN GIANT BUTTON: "I'M OKAY" */}
                  <button
                    id="resident-ok-button"
                    onClick={() => handleTap('ok')}
                    className={`flex-1 w-full rounded-3xl p-6 flex flex-col items-center justify-center text-center transition-all duration-150 active:scale-95 shadow-xl border-4 ${
                      isHighContrast
                        ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 border-white'
                        : 'bg-gradient-to-b from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-emerald-950 border-emerald-300/40'
                    }`}
                    style={{ minHeight: '190px' }}
                  >
                    <div className="w-20 h-20 rounded-full bg-emerald-950/20 flex items-center justify-center mb-3 shadow-inner">
                      <Check className="w-12 h-12 text-white stroke-[3.5]" />
                    </div>
                    <span className={`font-black uppercase tracking-tight text-white drop-shadow-sm ${
                      isLargeText ? 'text-3xl' : 'text-2xl'
                    }`}>
                      I&apos;M OKAY
                    </span>
                    <span className="text-xs font-bold text-emerald-100 mt-1 opacity-90">
                      Tap here to check in this morning
                    </span>
                  </button>

                  {/* RED GIANT BUTTON: "I NEED HELP" */}
                  <button
                    id="resident-help-button"
                    onClick={() => handleTap('not_ok')}
                    className={`flex-1 w-full rounded-3xl p-6 flex flex-col items-center justify-center text-center transition-all duration-150 active:scale-95 shadow-xl border-4 ${
                      isHighContrast
                        ? 'bg-rose-600 hover:bg-rose-500 text-white border-white'
                        : 'bg-gradient-to-b from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 text-white border-rose-400/40'
                    }`}
                    style={{ minHeight: '190px' }}
                  >
                    <div className="w-20 h-20 rounded-full bg-rose-950/30 flex items-center justify-center mb-3 shadow-inner">
                      <LifeBuoy className="w-12 h-12 text-white stroke-[3]" />
                    </div>
                    <span className={`font-black uppercase tracking-tight text-white drop-shadow-sm ${
                      isLargeText ? 'text-3xl' : 'text-2xl'
                    }`}>
                      I NEED HELP
                    </span>
                    <span className="text-xs font-bold text-rose-100 mt-1 opacity-90">
                      Tap if unwell or need care staff to visit
                    </span>
                  </button>

                </div>
              ) : resident.status === 'ok' ? (
                // SUCCESS CONFIRMATION STATE
                <div className="flex-1 flex flex-col items-center justify-center text-center p-5 bg-gradient-to-b from-emerald-950/40 to-slate-900 rounded-3xl border border-emerald-500/30 animate-in fade-in zoom-in duration-300">
                  <div className="w-24 h-24 rounded-full bg-emerald-500 flex items-center justify-center mb-4 shadow-lg shadow-emerald-500/30">
                    <CheckCircle2 className="w-14 h-14 text-white" />
                  </div>
                  
                  <span className="text-xs font-bold uppercase tracking-widest text-emerald-400">
                    Check-in Completed
                  </span>
                  <h3 className={`font-black text-white mt-1 ${
                    isLargeText ? 'text-3xl' : 'text-2xl'
                  }`}>
                    You&apos;re Checked In!
                  </h3>
                  
                  <p className="text-slate-300 text-sm mt-2 max-w-xs leading-relaxed">
                    Have a wonderful morning, <strong className="text-white">{resident.name}</strong>. Care staff has been notified.
                  </p>

                  <div className="mt-4 px-4 py-2 rounded-xl bg-slate-800/80 border border-slate-700/60 text-slate-300 text-xs font-mono">
                    Logged at {resident.checkInTime || '08:14 AM'}
                  </div>

                  <div className="mt-6 pt-6 border-t border-slate-800 w-full flex flex-col gap-2">
                    <p className="text-[11px] text-slate-400">
                      Need to change your answer?
                    </p>
                    <button
                      id="change-checkin-btn"
                      onClick={() => onCheckIn(resident.id, 'awaiting')}
                      className="w-full py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition flex items-center justify-center gap-2"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      Reset to Check-in Screen
                    </button>
                  </div>
                </div>
              ) : (
                // URGENT HELP REQUESTED STATE
                <div className="flex-1 flex flex-col items-center justify-center text-center p-5 bg-gradient-to-b from-rose-950/60 to-slate-900 rounded-3xl border-2 border-rose-500/60 animate-in fade-in zoom-in duration-300">
                  <div className="w-24 h-24 rounded-full bg-rose-600 flex items-center justify-center mb-4 shadow-lg shadow-rose-600/40 animate-pulse">
                    <AlertTriangle className="w-14 h-14 text-white" />
                  </div>

                  <span className="text-xs font-bold uppercase tracking-widest text-rose-400">
                    Help Request Logged
                  </span>
                  <h3 className={`font-black text-white mt-1 ${
                    isLargeText ? 'text-3xl' : 'text-2xl'
                  }`}>
                    Help Is On The Way
                  </h3>

                  <p className="text-slate-200 text-sm mt-2 max-w-xs leading-relaxed font-medium">
                    Care staff has been notified for <strong className="text-white">{resident.room}</strong>. Please rest comfortably.
                  </p>

                  {/* Immediate Emergency Calling Action */}
                  <a
                    href="tel:0825550000"
                    className="mt-5 w-full py-4 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white font-black text-base flex items-center justify-center gap-3 shadow-lg shadow-rose-900/50 active:scale-95 transition"
                  >
                    <PhoneCall className="w-5 h-5 animate-bounce" />
                    <span>Call Duty Care Station</span>
                  </a>

                  <button
                    onClick={() => onCheckIn(resident.id, 'awaiting')}
                    className="mt-4 text-xs text-slate-400 hover:text-slate-200 underline font-medium"
                  >
                    Cancel request (tapped by accident)
                  </button>
                </div>
              )}
            </div>

            {/* Bottom Support Footnote */}
            <div className="p-3 text-center bg-slate-950/80 border-t border-slate-800/80 text-[11px] text-slate-400">
              <span>ElderWatch SafeLink · Assistance: </span>
              <strong className="text-slate-200">Sr. Sarah Botha ({resident.caregiver})</strong>
            </div>

          </div>

          {/* Phone Bottom Home Bar Indicator */}
          <div className="w-full flex justify-center py-2">
            <div className="w-32 h-1 rounded-full bg-slate-700"></div>
          </div>
        </div>
      </div>

      {/* 1-Tap Pairing Modal */}
      {showPairModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-200 text-slate-900">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-emerald-100 text-emerald-800">
                  <QrCode className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base">Pair Resident&apos;s Phone</h3>
                  <p className="text-xs text-slate-500">{resident.name} · {resident.room}</p>
                </div>
              </div>
              <button
                onClick={() => setShowPairModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <div className="py-5 text-center flex flex-col items-center">
              {/* Simulated QR Code */}
              <div className="w-48 h-48 rounded-2xl bg-slate-100 border-2 border-dashed border-slate-300 p-3 flex flex-col items-center justify-center shadow-inner relative">
                <div className="grid grid-cols-6 gap-1.5 w-36 h-36">
                  {Array.from({ length: 36 }).map((_, i) => (
                    <div 
                      key={i} 
                      className={`rounded-xs ${
                        (i % 2 === 0 && i % 3 === 0) || i === 0 || i === 5 || i === 30 || i === 35 
                          ? 'bg-slate-900' 
                          : (i % 5 === 0 ? 'bg-emerald-600' : 'bg-slate-300')
                      }`} 
                    />
                  ))}
                </div>
                <span className="absolute bottom-2 text-[10px] font-mono font-bold text-slate-500 bg-white/80 px-2 py-0.5 rounded">
                  SAFE-PAIR-{resident.id.toUpperCase()}
                </span>
              </div>

              <div className="mt-4 text-xs text-slate-600 max-w-xs">
                Scan once with the resident&apos;s camera or send the SMS link. No login or password will ever be requested.
              </div>

              <div className="mt-3 w-full bg-slate-100 rounded-xl p-2.5 text-left font-mono text-[11px] text-slate-700 break-all border border-slate-200">
                https://elderwatch.care/c?t=ew_{resident.id}_{resident.room.replace(' ', '')}
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => {
                  navigator.clipboard?.writeText?.(`https://elderwatch.care/c?t=ew_${resident.id}`);
                  alert('Safe-link copied to clipboard!');
                }}
                className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition"
              >
                Copy SMS Safe Link
              </button>
              <button
                onClick={() => setShowPairModal(false)}
                className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
