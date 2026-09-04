import React, { useState } from 'react';
import { 
  X, 
  BookOpen, 
  Smartphone, 
  CheckCircle2, 
  AlertTriangle, 
  Link2, 
  QrCode, 
  Clock, 
  Share2, 
  ExternalLink,
  Copy,
  Check,
  ShieldCheck,
  Users,
  ArrowRight,
  Send
} from 'lucide-react';
import { CareHome, Resident } from '../types';

interface WorkflowGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  home?: CareHome;
  residents: Resident[];
  onOpenSeniorScreen?: (residentId?: string) => void;
}

export const WorkflowGuideModal: React.FC<WorkflowGuideModalProps> = ({
  isOpen,
  onClose,
  home,
  residents,
  onOpenSeniorScreen,
}) => {
  const [activeSection, setActiveSection] = useState<'resident' | 'links' | 'staff' | 'homescreen'>('resident');
  const [selectedResId, setSelectedResId] = useState<string>(residents[0]?.id || '');
  const [copiedLink, setCopiedLink] = useState(false);

  if (!isOpen) return null;

  const currentResident = residents.find((r) => r.id === selectedResId) || residents[0];
  const currentToken = currentResident?.verificationToken || (currentResident ? `ew_${currentResident.id}` : 'ew_demo_token');
  const safeHome = home || { id: 'home-benoni-01', name: 'Default Home', cutoffTime: '09:15' };
  const currentUrl = `${window.location.origin}/?verify=${currentToken}&home=${safeHome.id}`;

  const copyLink = () => {
    navigator.clipboard.writeText(currentUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const openWhatsApp = () => {
    const text = encodeURIComponent(
      `Good morning ${currentResident?.name || 'Resident'}! Here is your ElderWatch morning check-in link for ${safeHome.name}. Tap this link every morning before ${safeHome.cutoffTime} to let care staff know you are safe: ${currentUrl}`
    );
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#0b1118]/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-[#0f1722] rounded-3xl max-w-2xl w-full shadow-2xl border border-[#1e293b] text-[#e2e8f0] overflow-hidden flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-200">
        
        {/* Modal Header */}
        <div className="bg-[#0f1722] text-[#e2e8f0] p-5 sm:p-6 flex items-center justify-between border-b border-[#223040]">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-extrabold text-lg text-[#e2e8f0]">ElderWatch Workflow Guide</h2>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300">
                  Mobile & Staff
                </span>
              </div>
              <p className="text-xs text-[#94a3b8] mt-0.5">
                Complete operating instructions for residents, nursing staff & family
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-[#94a3b8] hover:text-[#e2e8f0] hover:bg-[#131d27] transition"
            aria-label="Close Guide"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Section Navigation Tabs (Horizontal Scroll on Mobile) */}
        <div className="flex items-center gap-1.5 p-3 bg-[#141d27] border-b border-[#1e293b] overflow-x-auto scrollbar-none text-xs font-bold">
          <button
            onClick={() => setActiveSection('resident')}
            className={`px-3.5 py-2 rounded-xl whitespace-nowrap transition flex items-center gap-1.5 ${
              activeSection === 'resident'
                ? 'bg-emerald-600 text-[#e2e8f0] shadow-sm'
                : 'bg-[#0f1722] text-[#e2e8f0] hover:bg-[#141d27]/80 border border-[#1e293b]'
            }`}
          >
            <Smartphone className="w-4 h-4" />
            <span>1. Senior Yes/No Screen</span>
          </button>

          <button
            onClick={() => setActiveSection('links')}
            className={`px-3.5 py-2 rounded-xl whitespace-nowrap transition flex items-center gap-1.5 ${
              activeSection === 'links'
                ? 'bg-emerald-600 text-[#e2e8f0] shadow-sm'
                : 'bg-[#0f1722] text-[#e2e8f0] hover:bg-[#141d27]/80 border border-[#1e293b]'
            }`}
          >
            <Link2 className="w-4 h-4" />
            <span>2. Links & Pairing</span>
          </button>

          <button
            onClick={() => setActiveSection('staff')}
            className={`px-3.5 py-2 rounded-xl whitespace-nowrap transition flex items-center gap-1.5 ${
              activeSection === 'staff'
                ? 'bg-emerald-600 text-[#e2e8f0] shadow-sm'
                : 'bg-[#0f1722] text-[#e2e8f0] hover:bg-[#141d27]/80 border border-[#1e293b]'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>3. Staff Triage Protocol</span>
          </button>

          <button
            onClick={() => setActiveSection('homescreen')}
            className={`px-3.5 py-2 rounded-xl whitespace-nowrap transition flex items-center gap-1.5 ${
              activeSection === 'homescreen'
                ? 'bg-emerald-600 text-[#e2e8f0] shadow-sm'
                : 'bg-[#0f1722] text-[#e2e8f0] hover:bg-[#141d27]/80 border border-[#1e293b]'
            }`}
          >
            <Share2 className="w-4 h-4" />
            <span>4. Add to Home Screen</span>
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 text-[#e2e8f0] text-xs sm:text-sm leading-relaxed">
          
          {/* SECTION 1: THE SENIOR YES/NO SCREEN */}
          {activeSection === 'resident' && (
            <div className="space-y-4">
              <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-2xl">
                <h3 className="font-extrabold text-emerald-950 text-sm flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  What the Senior Sees on Their Phone
                </h3>
                <p className="text-emerald-900/90 text-xs mt-1">
                  When a resident opens their link, they are greeted by name with zero login prompts, zero passwords, and two giant, high-contrast buttons:
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Green Button Card */}
                <div className="p-4 rounded-2xl bg-emerald-600 text-[#e2e8f0] space-y-2 shadow-md">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-base tracking-wide flex items-center gap-1.5">
                      <CheckCircle2 className="w-5 h-5" /> I AM OK (YES)
                    </span>
                    <span className="text-[10px] bg-[#0f1722]/20 px-2 py-0.5 rounded font-bold uppercase">Daily Safety</span>
                  </div>
                  <p className="text-emerald-100 text-xs leading-normal">
                    The senior taps this once every morning (e.g. between 07:00 and 09:15). It plays a pleasant chime, vibrates, and marks them <strong>Checked In OK</strong> on the nursing board.
                  </p>
                </div>

                {/* Red Button Card */}
                <div className="p-4 rounded-2xl bg-rose-600 text-[#e2e8f0] space-y-2 shadow-md">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-base tracking-wide flex items-center gap-1.5">
                      <AlertTriangle className="w-5 h-5" /> I NEED HELP (NO)
                    </span>
                    <span className="text-[10px] bg-[#0f1722]/20 px-2 py-0.5 rounded font-bold uppercase">Urgent Alert</span>
                  </div>
                  <p className="text-rose-100 text-xs leading-normal">
                    If they feel dizzy, have fallen, or need nursing assistance, tapping this triggers a high-priority alert on the staff dashboard and dispatches the nurse on duty to their room.
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-[#0f1722] border border-[#1e293b] space-y-2 text-xs">
                <h4 className="font-bold text-[#e2e8f0]">Key Senior-Friendly Features:</h4>
                <ul className="list-disc pl-4 space-y-1 text-[#94a3b8]">
                  <li><strong>Touch targets over 110px high</strong>: Designed specifically for arthritic hands and tremors.</li>
                  <li><strong>Tactile Tone & Vibration</strong>: Web Audio synthesizer tone and haptic rumble confirm every tap.</li>
                  <li><strong>7-Day Visual Strip</strong>: Reassures the resident with 7 daily checkmarks for peace of mind.</li>
                  <li><strong>Direct Nurse Call</strong>: One tap calls the care desk phone line if they need to speak with staff.</li>
                </ul>
              </div>

              {onOpenSeniorScreen && (
                <div className="pt-2 flex justify-end">
                  <button
                    onClick={() => {
                      onClose();
                      onOpenSeniorScreen(currentResident?.id);
                    }}
                    className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-[#e2e8f0] font-bold text-xs flex items-center gap-2 shadow-sm transition"
                  >
                    <span>Open Live Senior Check-In Screen Now</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          )}

          {/* SECTION 2: THE LINKS & PAIRING WORKFLOW */}
          {activeSection === 'links' && (
            <div className="space-y-4">
              <div className="bg-sky-50 border border-sky-200 p-4 rounded-2xl">
                <h3 className="font-extrabold text-sky-950 text-sm flex items-center gap-2">
                  <Link2 className="w-4 h-4 text-sky-700" />
                  The Resident Link Structure
                </h3>
                <p className="text-sky-900/90 text-xs mt-1">
                  Each resident receives a persistent link tied to their room, facility, and cell phone number.
                </p>
              </div>

              {/* Link Formats Card */}
              <div className="p-4 rounded-2xl bg-[#0f1722] text-[#e2e8f0] space-y-3 font-mono text-xs">
                <div>
                  <span className="text-[#94a3b8] block text-[11px] font-sans font-bold">1. One-Click Device Pairing Link:</span>
                  <p className="text-emerald-400 break-all select-all mt-0.5">
                    https://[APP-URL]/?verify=[TOKEN]&home=[HOME_ID]
                  </p>
                  <p className="text-[#94a3b8] font-sans text-[11px] mt-0.5">
                    Auto-links the resident's phone to the care home upon first tap.
                  </p>
                </div>

                <div className="pt-2 border-t border-[#223040]">
                  <span className="text-[#94a3b8] block text-[11px] font-sans font-bold">2. Direct Resident Profile Link:</span>
                  <p className="text-sky-300 break-all select-all mt-0.5">
                    https://[APP-URL]/?residentId=[RESIDENT_ID]
                  </p>
                  <p className="text-[#94a3b8] font-sans text-[11px] mt-0.5">
                    Opens directly into that specific resident's check-in screen.
                  </p>
                </div>

                <div className="pt-2 border-t border-[#223040]">
                  <span className="text-[#94a3b8] block text-[11px] font-sans font-bold">3. General Check-In Mode:</span>
                  <p className="text-amber-300 break-all select-all mt-0.5">
                    https://[APP-URL]/?mode=checkin
                  </p>
                  <p className="text-[#94a3b8] font-sans text-[11px] mt-0.5">
                    Re-opens the resident's saved screen from browser memory.
                  </p>
                </div>
              </div>

              {/* Active Link Generator */}
              <div className="p-4 rounded-2xl bg-[#0f1722] border border-[#1e293b] space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <span className="font-bold text-[#e2e8f0] text-xs">Generate Link For Resident:</span>
                  {residents.length > 0 ? (
                    <select
                      value={selectedResId}
                      onChange={(e) => setSelectedResId(e.target.value)}
                      className="text-xs bg-[#0f1722] border border-[#223040] rounded-xl px-2.5 py-1.5 font-semibold text-[#e2e8f0] focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                      {residents.map((r) => (
                        <option key={r.id} value={r.id}>
                          {r.name} ({r.room})
                        </option>
                      ))}
                    </select>
                  ) : (
                    <span className="text-xs text-amber-700 italic">No residents added yet (add one in Staff Dashboard)</span>
                  )}
                </div>

                <div className="bg-[#0f1722] p-3 rounded-xl border border-[#1e293b] flex items-center justify-between gap-2">
                  <code className="text-[11px] text-[#e2e8f0] font-mono truncate max-w-[320px] sm:max-w-md">
                    {currentUrl}
                  </code>
                  <button
                    onClick={copyLink}
                    className="shrink-0 px-3 py-1.5 rounded-lg bg-[#141d27] hover:bg-[#141d27] text-[#e2e8f0] font-bold text-xs flex items-center gap-1.5 transition"
                  >
                    {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedLink ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <button
                    onClick={openWhatsApp}
                    className="flex-1 py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-[#e2e8f0] font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs transition"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Send via WhatsApp</span>
                  </button>
                  {onOpenSeniorScreen && (
                    <button
                      onClick={() => {
                        onClose();
                        onOpenSeniorScreen(currentResident?.id);
                      }}
                      className="py-2 px-3 rounded-xl bg-[#0f1722] hover:bg-[#131d27] text-[#e2e8f0] font-bold text-xs flex items-center gap-1.5 transition"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Test View</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* SECTION 3: STAFF TRIAGE PROTOCOL */}
          {activeSection === 'staff' && (
            <div className="space-y-4">
              <div className="bg-amber-50 border border-amber-200 p-4 rounded-2xl">
                <h3 className="font-extrabold text-amber-950 text-sm flex items-center gap-2">
                  <Clock className="w-4 h-4 text-amber-700" />
                  Morning Protocol & Cutoff Rules
                </h3>
                <p className="text-amber-900/90 text-xs mt-1">
                  How ElderWatch replaces 80 manual door knocks with targeted 2-minute safety reassurance:
                </p>
              </div>

              {/* Timeline Steps */}
              <div className="space-y-3">
                <div className="p-3.5 rounded-2xl bg-[#0f1722] border border-[#1e293b] flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-[#0f1722] text-[#e2e8f0] font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                    1
                  </span>
                  <div>
                    <h4 className="font-bold text-[#e2e8f0] text-xs">06:30 AM — Morning Board Opens</h4>
                    <p className="text-[#94a3b8] text-xs mt-0.5">
                      All enrolled residents start in the <span className="bg-[#141d27] px-1 rounded text-[#e2e8f0] font-semibold">Awaiting</span> state.
                    </p>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-emerald-600 text-[#e2e8f0] font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                    2
                  </span>
                  <div>
                    <h4 className="font-bold text-emerald-950 text-xs">06:30 – {home.cutoffTime} AM — Natural Check-Ins</h4>
                    <p className="text-emerald-900/80 text-xs mt-0.5">
                      As seniors wake up, they tap their big green "I AM OK" button. Cards turn green in real-time on the staff dashboard with exact timestamps.
                    </p>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-rose-600 text-[#e2e8f0] font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                    3
                  </span>
                  <div>
                    <h4 className="font-bold text-rose-950 text-xs">Instant Emergency Interventions</h4>
                    <p className="text-rose-900/80 text-xs mt-0.5">
                      If anyone taps "I NEED HELP", the dashboard sounds an audible alert, flashes red, and prompts nursing staff to immediately dispatch assistance to that room.
                    </p>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-amber-600 text-[#e2e8f0] font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                    4
                  </span>
                  <div>
                    <h4 className="font-bold text-amber-950 text-xs">{home.cutoffTime} AM — Cutoff Threshold Reached</h4>
                    <p className="text-amber-900/80 text-xs mt-0.5">
                      Any resident who has not checked in by {home.cutoffTime} automatically becomes <span className="bg-amber-100 text-amber-900 font-bold px-1 rounded">⚠️ OVERDUE</span>.
                      Caregivers only need to visit the rooms flagged overdue instead of walking the entire facility.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SECTION 4: ADD TO PHONE HOME SCREEN */}
          {activeSection === 'homescreen' && (
            <div className="space-y-4">
              <div className="bg-indigo-50 border border-indigo-200 p-4 rounded-2xl">
                <h3 className="font-extrabold text-indigo-950 text-sm flex items-center gap-2">
                  <Share2 className="w-4 h-4 text-indigo-700" />
                  Turn into a 1-Tap App Icon on Phone
                </h3>
                <p className="text-indigo-900/90 text-xs mt-1">
                  Seniors never have to search for text messages or remember web addresses. Save ElderWatch as an icon directly on their smartphone home screen:
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {/* iPhone Instructions */}
                <div className="p-4 rounded-2xl bg-[#0f1722] border border-[#1e293b] space-y-2">
                  <div className="flex items-center gap-2 font-bold text-[#e2e8f0] text-xs">
                    <span className="w-5 h-5 rounded-full bg-[#0f1722] text-[#e2e8f0] flex items-center justify-center text-[10px]">🍎</span>
                    <span>On Apple iPhone (Safari)</span>
                  </div>
                  <ol className="list-decimal pl-4 space-y-1.5 text-xs text-[#94a3b8]">
                    <li>Open the check-in link in <strong>Safari</strong>.</li>
                    <li>Tap the <strong>Share button</strong> (square icon with an arrow pointing up at the bottom).</li>
                    <li>Scroll down and tap <strong>"Add to Home Screen"</strong>.</li>
                    <li>Tap <strong>"Add"</strong> in the top-right corner.</li>
                  </ol>
                  <p className="text-[11px] font-semibold text-emerald-700 mt-2">
                    ✓ The ElderWatch icon is now right on their home screen!
                  </p>
                </div>

                {/* Android Instructions */}
                <div className="p-4 rounded-2xl bg-[#0f1722] border border-[#1e293b] space-y-2">
                  <div className="flex items-center gap-2 font-bold text-[#e2e8f0] text-xs">
                    <span className="w-5 h-5 rounded-full bg-emerald-600 text-[#e2e8f0] flex items-center justify-center text-[10px]">🤖</span>
                    <span>On Android (Google Chrome)</span>
                  </div>
                  <ol className="list-decimal pl-4 space-y-1.5 text-xs text-[#94a3b8]">
                    <li>Open the check-in link in <strong>Chrome</strong>.</li>
                    <li>Tap the <strong>three vertical dots (⋮)</strong> in the top right.</li>
                    <li>Tap <strong>"Add to Home screen"</strong> or <strong>"Install app"</strong>.</li>
                    <li>Tap <strong>"Add"</strong> to confirm.</li>
                  </ol>
                  <p className="text-[11px] font-semibold text-emerald-700 mt-2">
                    ✓ Opens full-screen with 1 tap every morning!
                  </p>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-[#0f1722] border-t border-[#1e293b] flex items-center justify-between text-xs text-[#94a3b8]">
          <span>ElderWatch Reassurance Protocol · 4TIFY SECURITY</span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-[#0f1722] hover:bg-[#131d27] text-[#e2e8f0] font-bold text-xs transition"
          >
            Close Guide
          </button>
        </div>

      </div>
    </div>
  );
};
