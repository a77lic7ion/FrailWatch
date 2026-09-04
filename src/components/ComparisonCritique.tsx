import React, { useState } from 'react';
import { 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  ShieldCheck, 
  Smartphone, 
  Sparkles, 
  Layers, 
  Eye, 
  Clock, 
  HeartHandshake, 
  Building2,
  Check,
  X,
  ArrowRight
} from 'lucide-react';

export const ComparisonCritique: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'visual' | 'scorecard' | 'principles'>('visual');

  return (
    <div className="py-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-6">
      
      {/* Header Banner */}
      <div className="bg-[#0f1722] rounded-3xl p-6 sm:p-7 border border-stone-200/80 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-black uppercase tracking-wider bg-indigo-100 text-indigo-800">
                Design Critique & Comparative Analysis
              </span>
              <span className="text-xs text-stone-500 font-medium">
                frailcare-checkin.web.app ➔ ElderWatch Redesign
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight mt-1">
              Legacy Layout Comparison & UX Redesign
            </h1>
            <p className="text-xs sm:text-sm text-stone-600 mt-1 max-w-3xl leading-relaxed">
              A comprehensive evaluation of the original <em>FrailCare Check-in</em> web app against the new <em>ElderWatch</em> paradigm, focusing on elderly usability, morning clinical triage, and zero-hardware care operations.
            </p>
          </div>

          <div className="flex items-center gap-2 bg-stone-100 p-1 rounded-2xl border border-stone-200 text-xs font-bold">
            <button
              onClick={() => setActiveTab('visual')}
              className={`px-3.5 py-2 rounded-xl transition ${
                activeTab === 'visual' ? 'bg-[#0f1722] text-stone-900 shadow-sm' : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              Side-by-Side Comparison
            </button>
            <button
              onClick={() => setActiveTab('scorecard')}
              className={`px-3.5 py-2 rounded-xl transition ${
                activeTab === 'scorecard' ? 'bg-[#0f1722] text-stone-900 shadow-sm' : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              UX Scorecard
            </button>
            <button
              onClick={() => setActiveTab('principles')}
              className={`px-3.5 py-2 rounded-xl transition ${
                activeTab === 'principles' ? 'bg-[#0f1722] text-stone-900 shadow-sm' : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              Design Principles
            </button>
          </div>
        </div>
      </div>

      {activeTab === 'visual' && (
        <div className="space-y-6">
          {/* VISUAL COMPARISON 1: THE RESIDENT PHONE SCREEN */}
          <div className="bg-[#0f1722] rounded-3xl p-6 border border-stone-200 shadow-sm">
            <div className="mb-4">
              <span className="text-xs font-extrabold uppercase tracking-wider text-stone-400">
                Interface 01
              </span>
              <h2 className="text-xl font-black text-stone-900">
                The Resident Experience: Shaky Hands & Low Vision
              </h2>
              <p className="text-xs text-stone-500 mt-0.5">
                Comparing what an 82-year-old resident sees at 07:30 AM every morning.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* LEGACY BEFORE */}
              <div className="bg-stone-950 rounded-2xl p-5 border border-stone-800 text-stone-300 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between pb-3 border-b border-stone-800 mb-4">
                    <span className="text-xs font-bold uppercase tracking-wider text-rose-400 flex items-center gap-1.5">
                      <XCircle className="w-4 h-4 text-rose-500" />
                      Legacy FrailCare Layout
                    </span>
                    <span className="text-[11px] text-stone-500 font-mono">frailcare-checkin.web.app</span>
                  </div>

                  {/* Simulated legacy UI */}
                  <div className="bg-black rounded-xl p-4 border border-stone-900 space-y-3 font-sans text-left">
                    <div className="bg-[#1a1a1a] text-stone-300 text-center py-2.5 text-xs font-semibold rounded">
                      Good day, Margaret. Please tap below
                    </div>
                    <div className="grid grid-cols-1 gap-2">
                      <button className="w-full bg-[#1D9E75] text-[#04342C] font-bold py-6 text-2xl rounded">
                        Yes
                      </button>
                      <button className="w-full bg-[#E24B4A] text-[#501313] font-bold py-6 text-2xl rounded">
                        No
                      </button>
                    </div>
                  </div>

                  <div className="mt-4 space-y-2 text-xs">
                    <div className="flex items-start gap-2 text-rose-300">
                      <span className="font-bold text-rose-400 shrink-0">❌ Flaw:</span>
                      <span>Ambiguous wording (&quot;Yes&quot; / &quot;No&quot;). What does &quot;No&quot; mean? No I am not okay, or No I don&apos;t want to check in?</span>
                    </div>
                    <div className="flex items-start gap-2 text-rose-300">
                      <span className="font-bold text-rose-400 shrink-0">❌ Flaw:</span>
                      <span>Requires resident phone number typing on login screen if cookie/session expires.</span>
                    </div>
                    <div className="flex items-start gap-2 text-rose-300">
                      <span className="font-bold text-rose-400 shrink-0">❌ Flaw:</span>
                      <span>Stark pitch-black terminal styling is clinical, confusing, and lacks comforting reassurance.</span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-stone-800/80 text-[11px] text-stone-500">
                  Critical failure: Cognitive hesitation and high accidental mis-taps.
                </div>
              </div>

              {/* NEW ELDERWATCH REDESIGN */}
              <div className="bg-stone-900 rounded-2xl p-5 border-2 border-emerald-500/50 text-[#e2e8f0] flex flex-col justify-between shadow-md">
                <div>
                  <div className="flex items-center justify-between pb-3 border-b border-stone-800 mb-4">
                    <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      ElderWatch Redesign
                    </span>
                    <span className="text-[11px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded font-mono font-bold">
                      Zero Friction
                    </span>
                  </div>

                  {/* Simulated new UI */}
                  <div className="bg-stone-950 rounded-xl p-4 border border-stone-800 space-y-3 font-sans text-center">
                    <div className="bg-stone-900 text-stone-200 text-xs font-bold py-2 rounded-lg border border-stone-800">
                      Good morning, Margaret · Room 14
                    </div>
                    <div className="grid grid-cols-1 gap-2.5">
                      <div className="bg-gradient-to-r from-emerald-600 to-emerald-500 text-[#e2e8f0] font-black py-4 rounded-xl flex items-center justify-center gap-2 text-base shadow-sm">
                        <Check className="w-5 h-5 stroke-[3]" />
                        <span>I&apos;M OKAY</span>
                      </div>
                      <div className="bg-gradient-to-r from-rose-600 to-rose-700 text-[#e2e8f0] font-black py-4 rounded-xl flex items-center justify-center gap-2 text-base shadow-sm">
                        <AlertTriangle className="w-5 h-5 stroke-[3]" />
                        <span>I NEED HELP</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 space-y-2 text-xs">
                    <div className="flex items-start gap-2 text-emerald-300">
                      <span className="font-bold text-emerald-400 shrink-0">✓ Solution:</span>
                      <span>Unmistakable language: <strong>&quot;I&apos;M OKAY&quot;</strong> and <strong>&quot;I NEED HELP&quot;</strong> with distinct icons and tactile auditory confirmation.</span>
                    </div>
                    <div className="flex items-start gap-2 text-emerald-300">
                      <span className="font-bold text-emerald-400 shrink-0">✓ Solution:</span>
                      <span>Zero login, zero typing. Device is paired permanently via 1-tap QR scan or SMS link.</span>
                    </div>
                    <div className="flex items-start gap-2 text-emerald-300">
                      <span className="font-bold text-emerald-400 shrink-0">✓ Solution:</span>
                      <span>Shaky-hand accidental tap tolerance with an immediate, reassuring 10-second undo window.</span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-stone-800 text-[11px] text-emerald-400 font-semibold">
                  Outcome: 100% senior self-reliance, zero frustration or hesitation.
                </div>
              </div>

            </div>
          </div>

          {/* VISUAL COMPARISON 2: STAFF & CARE HOME DASHBOARD */}
          <div className="bg-[#0f1722] rounded-3xl p-6 border border-stone-200 shadow-sm">
            <div className="mb-4">
              <span className="text-xs font-extrabold uppercase tracking-wider text-stone-400">
                Interface 02
              </span>
              <h2 className="text-xl font-black text-stone-900">
                The Care Staff Experience: 2-Minute Morning Review vs. Manual Walking Rounds
              </h2>
              <p className="text-xs text-stone-500 mt-0.5">
                Replacing an hour of door-to-door checks with real-time exception triage.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* LEGACY ADMIN */}
              <div className="bg-stone-950 rounded-2xl p-5 border border-stone-800 text-stone-300 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between pb-3 border-b border-stone-800 mb-4">
                    <span className="text-xs font-bold uppercase tracking-wider text-rose-400 flex items-center gap-1.5">
                      <XCircle className="w-4 h-4 text-rose-500" />
                      Legacy FrailCare Admin
                    </span>
                    <span className="text-[11px] text-stone-500 font-mono">/admin</span>
                  </div>

                  <div className="bg-[#141414] rounded-xl p-4 border border-[#262626] space-y-2 text-xs">
                    <div className="text-stone-400 text-[11px] font-bold">Today</div>
                    <div className="p-3 bg-[#161616] rounded-lg border border-[#262626] flex items-center justify-between">
                      <div>
                        <div className="font-bold text-[#e2e8f0]">Resident</div>
                        <div className="text-stone-500 text-[10px]">+27825551201</div>
                      </div>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-400">ok</span>
                    </div>
                    <div className="text-stone-500 text-[10px] text-center pt-2">
                      (Cards only show raw phone numbers; browser prompts used for editing)
                    </div>
                  </div>

                  <div className="mt-4 space-y-2 text-xs">
                    <div className="flex items-start gap-2 text-rose-300">
                      <span className="font-bold text-rose-400 shrink-0">❌ Flaw:</span>
                      <span>Cards show &quot;Resident&quot; and raw phone number instead of prominent Room Number and resident name.</span>
                    </div>
                    <div className="flex items-start gap-2 text-rose-300">
                      <span className="font-bold text-rose-400 shrink-0">❌ Flaw:</span>
                      <span>Relied on browser `prompt()` and `confirm()` dialogs that frequently crash or get blocked on tablets.</span>
                    </div>
                    <div className="flex items-start gap-2 text-rose-300">
                      <span className="font-bold text-rose-400 shrink-0">❌ Flaw:</span>
                      <span>No morning cutoff countdown timer, no summary ratios (e.g. 18/24 checked in), no emergency family contacts.</span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-stone-800 text-[11px] text-stone-500">
                  Critical failure: Staff cannot glance and act within seconds.
                </div>
              </div>

              {/* NEW ELDERWATCH DASHBOARD */}
              <div className="bg-stone-900 rounded-2xl p-5 border-2 border-emerald-500/50 text-[#e2e8f0] flex flex-col justify-between shadow-md">
                <div>
                  <div className="flex items-center justify-between pb-3 border-b border-stone-800 mb-4">
                    <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      ElderWatch Clinical Dashboard
                    </span>
                    <span className="text-[11px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded font-mono font-bold">
                      Exception Triage
                    </span>
                  </div>

                  <div className="bg-stone-950 rounded-xl p-4 border border-stone-800 space-y-2 text-xs">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-amber-400 font-bold">Cutoff 09:15 AM · 18 min left</span>
                      <span className="text-emerald-400 font-bold">85% Checked In</span>
                    </div>
                    <div className="p-3 bg-rose-950/40 rounded-lg border border-rose-500/40 flex items-center justify-between">
                      <div>
                        <div className="font-bold text-[#e2e8f0] flex items-center gap-1.5">
                          <span>Arthur Pendelton</span>
                          <span className="px-1.5 py-0.2 rounded bg-rose-600 text-[10px]">Room 07</span>
                        </div>
                        <div className="text-rose-300 text-[10px]">Tapped &quot;I Need Help&quot; · 08:31 AM</div>
                      </div>
                      <span className="text-[10px] px-2 py-1 rounded bg-rose-600 text-[#e2e8f0] font-bold animate-pulse">
                        Dispatch Carer
                      </span>
                    </div>
                  </div>

                  <div className="mt-4 space-y-2 text-xs">
                    <div className="flex items-start gap-2 text-emerald-300">
                      <span className="font-bold text-emerald-400 shrink-0">✓ Solution:</span>
                      <span>Clear visual triage: High-priority Urgent Queue pushes anyone who needs help or missed cutoff to the top.</span>
                    </div>
                    <div className="flex items-start gap-2 text-emerald-300">
                      <span className="font-bold text-emerald-400 shrink-0">✓ Solution:</span>
                      <span>Room numbers, wings, assigned caregivers, and family emergency phones are visible in one tap.</span>
                    </div>
                    <div className="flex items-start gap-2 text-emerald-300">
                      <span className="font-bold text-emerald-400 shrink-0">✓ Solution:</span>
                      <span>Cutoff timer ensures <em>nobody falls through the cracks</em> just because they forgot to open an app.</span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-stone-800 text-[11px] text-emerald-400 font-semibold">
                  Outcome: True 2-minute morning review replaces 60 minutes of walking.
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

      {activeTab === 'scorecard' && (
        <div className="bg-[#0f1722] rounded-3xl p-6 border border-stone-200 shadow-sm">
          <h2 className="text-xl font-black text-stone-900 mb-2">UX & Operational Architecture Scorecard</h2>
          <p className="text-xs text-stone-500 mb-6">
            Detailed criteria-by-criteria assessment comparing the original design against the ElderWatch redesign.
          </p>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-stone-200 text-stone-400 uppercase font-bold text-[11px]">
                  <th className="py-3 px-4">Evaluation Dimension</th>
                  <th className="py-3 px-4 text-rose-700">Legacy FrailCare Layout</th>
                  <th className="py-3 px-4 text-emerald-700">ElderWatch Redesign</th>
                  <th className="py-3 px-4">Operational Impact</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 text-stone-700">
                <tr>
                  <td className="py-3.5 px-4 font-bold text-stone-900">
                    Elderly Usability (Tremors / Vision)
                  </td>
                  <td className="py-3.5 px-4 text-rose-600">
                    Flat buttons labeled &quot;Yes&quot; / &quot;No&quot;, no tactile audio, no accidental-tap undo.
                  </td>
                  <td className="py-3.5 px-4 text-emerald-700 font-bold">
                    Giant 190px+ touch zones (&quot;I&apos;M OKAY&quot; / &quot;I NEED HELP&quot;), audio confirmation, 10s undo.
                  </td>
                  <td className="py-3.5 px-4 text-stone-600">
                    Eliminates mis-taps and anxiety for frail residents.
                  </td>
                </tr>

                <tr>
                  <td className="py-3.5 px-4 font-bold text-stone-900">
                    Device Pairing & Authentication
                  </td>
                  <td className="py-3.5 px-4 text-rose-600">
                    Prompts senior to type 10-digit mobile number on tiny keyboard if session clears.
                  </td>
                  <td className="py-3.5 px-4 text-emerald-700 font-bold">
                    1-Tap SMS SafeLink or staff QR scan. Zero typing, zero login ever.
                  </td>
                  <td className="py-3.5 px-4 text-stone-600">
                    Zero tech support calls; seniors never get locked out.
                  </td>
                </tr>

                <tr>
                  <td className="py-3.5 px-4 font-bold text-stone-900">
                    Morning Cutoff Safety Mechanism
                  </td>
                  <td className="py-3.5 px-4 text-rose-600">
                    Static cutoff value with no countdown timer or active escalation alerts.
                  </td>
                  <td className="py-3.5 px-4 text-emerald-700 font-bold">
                    Live cutoff clock; automated escalation into Priority Door-Check queue.
                  </td>
                  <td className="py-3.5 px-4 text-stone-600">
                    Zero residents fall through the cracks.
                  </td>
                </tr>

                <tr>
                  <td className="py-3.5 px-4 font-bold text-stone-900">
                    Staff Workflow & Speed
                  </td>
                  <td className="py-3.5 px-4 text-rose-600">
                    Shows raw phone numbers in dark boxes. Browser alerts for editing.
                  </td>
                  <td className="py-3.5 px-4 text-emerald-700 font-bold">
                    Room-first cards, triage metrics, 1-click nurse dispatch, 7-day history.
                  </td>
                  <td className="py-3.5 px-4 text-stone-600">
                    Reduces morning check time from 60 minutes to 2 minutes.
                  </td>
                </tr>

                <tr>
                  <td className="py-3.5 px-4 font-bold text-stone-900">
                    Family Peace of Mind
                  </td>
                  <td className="py-3.5 px-4 text-rose-600">
                    Not implemented; family must call facility reception individually.
                  </td>
                  <td className="py-3.5 px-4 text-emerald-700 font-bold">
                    Dedicated Family Portal with automated SMS reassuring them mom checked in safe.
                  </td>
                  <td className="py-3.5 px-4 text-stone-600">
                    Massive reduction in reception phone call volume.
                  </td>
                </tr>

                <tr>
                  <td className="py-3.5 px-4 font-bold text-stone-900">
                    4tify / Security Partner Add-on
                  </td>
                  <td className="py-3.5 px-4 text-rose-600">
                    None; standalone ad-hoc applet.
                  </td>
                  <td className="py-3.5 px-4 text-emerald-700 font-bold">
                    B2B Multi-facility tenant hub with 24/7 security dispatch integration.
                  </td>
                  <td className="py-3.5 px-4 text-stone-600">
                    High-margin service add-on with zero hardware capital expenditure.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'principles' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          <div className="bg-[#0f1722] rounded-3xl p-6 border border-stone-200 shadow-sm space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
              <Smartphone className="w-5 h-5" />
            </div>
            <h3 className="font-extrabold text-base text-stone-900">1. Cognitive & Physical Simplicity</h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              When designing for seniors, every additional element on screen increases cognitive friction and abandonment risk. ElderWatch removes all tabs, menus, settings, and profile links from the resident phone screen. Once set up, the resident only sees two giant buttons.
            </p>
          </div>

          <div className="bg-[#0f1722] rounded-3xl p-6 border border-stone-200 shadow-sm space-y-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-800 flex items-center justify-center font-bold">
              <Clock className="w-5 h-5" />
            </div>
            <h3 className="font-extrabold text-base text-stone-900">2. Exception-Based Care Triage</h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              Care staff do not need to spend time reviewing residents who are already confirmed safe. By auto-resolving the 90%+ of residents who check in green, staff attention is concentrated 100% on residents who flagged for help or passed the cutoff time without responding.
            </p>
          </div>

          <div className="bg-[#0f1722] rounded-3xl p-6 border border-stone-200 shadow-sm space-y-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
              <Building2 className="w-5 h-5" />
            </div>
            <h3 className="font-extrabold text-base text-stone-900">3. Zero-Hardware Scalability</h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              Proprietary wearable buttons and radio hubs cost thousands to install and maintain, and seniors frequently forget to wear or charge them. ElderWatch runs as a PWA on any smartphone or tablet the senior already has at bedside, turning care security into pure software.
            </p>
          </div>

        </div>
      )}

    </div>
  );
};
