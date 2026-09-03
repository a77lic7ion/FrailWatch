import React, { useState } from 'react';
import { 
  Heart, 
  ShieldCheck, 
  Bell, 
  Smartphone, 
  CheckCircle2, 
  Phone, 
  Calendar, 
  TrendingUp, 
  Building, 
  Radio, 
  Shield, 
  Users,
  Check
} from 'lucide-react';
import { Resident, CareHome } from '../types';
import { Logo } from './Logo';

interface FamilyAndProviderViewProps {
  residents: Resident[];
  selectedHome: CareHome;
}

export const FamilyAndProviderView: React.FC<FamilyAndProviderViewProps> = ({
  residents,
  selectedHome,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'family' | '4tify'>('family');
  const [selectedFamilyResidentId, setSelectedFamilyResidentId] = useState<string>(residents[0]?.id || 'res-1');
  const [smsAlertEnabled, setSmsAlertEnabled] = useState(true);

  const fallbackResident: Resident = {
    id: 'res-1',
    name: 'Resident',
    room: 'Room 1',
    wing: 'Willow Cottage',
    phone: '+27 82 455 1092',
    deviceLinked: true,
    status: 'ok',
    checkInTime: '08:14 AM',
    caregiver: 'Sr. Sarah Botha',
    medicalAlerts: [],
    notes: '',
    emergencyContact: {
      name: 'Family Contact',
      relationship: 'Family',
      phone: '+27 83 291 0044',
      notifyOnIssue: true,
    },
    sevenDayHistory: [
      { date: '2026-08-28', day: 'Fri', status: 'ok', time: '08:10 AM' },
      { date: '2026-08-29', day: 'Sat', status: 'ok', time: '08:15 AM' },
      { date: '2026-08-30', day: 'Sun', status: 'ok', time: '08:05 AM' },
      { date: '2026-08-31', day: 'Mon', status: 'ok', time: '08:20 AM' },
      { date: '2026-09-01', day: 'Tue', status: 'ok', time: '08:12 AM' },
      { date: '2026-09-02', day: 'Wed', status: 'ok', time: '08:18 AM' },
      { date: '2026-09-03', day: 'Today', status: 'ok', time: '08:14 AM' },
    ],
  };

  const resident = residents.find((r) => r.id === selectedFamilyResidentId) || residents[0] || fallbackResident;
  const isOk = resident.status === 'ok';
  const historyList = (resident.sevenDayHistory && resident.sevenDayHistory.length > 0)
    ? resident.sevenDayHistory
    : fallbackResident.sevenDayHistory;

  return (
    <div className="py-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-6">
      
      {/* Sub-navigation Switcher */}
      <div className="flex items-center justify-center">
        <div className="bg-slate-200/80 p-1.5 rounded-2xl flex items-center gap-2 border border-slate-300/70 shadow-xs">
          <button
            onClick={() => setActiveSubTab('family')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-extrabold transition-all ${
              activeSubTab === 'family'
                ? 'bg-white text-slate-900 shadow-sm border border-slate-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Heart className="w-4 h-4 text-rose-500" />
            <span>Family Reassurance Portal</span>
          </button>

          <button
            onClick={() => setActiveSubTab('4tify')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-extrabold transition-all ${
              activeSubTab === '4tify'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Shield className="w-4 h-4 text-emerald-400" />
            <span>4TIFY Security & Care Provider Hub</span>
          </button>
        </div>
      </div>

      {activeSubTab === 'family' ? (
        /* ================= FAMILY PORTAL ================= */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Main Reassurance Hero Card (2 Cols) */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Header & Resident Selector */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3.5">
                <Logo className="w-10 h-10 mt-1 drop-shadow-xs" />
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                    Morning Peace of Mind
                  </span>
                  <h2 className="text-2xl font-black text-slate-900 tracking-tight mt-1">
                    Family Loved One Check-In
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Know your loved one is safe every morning, without the home needing to make dozens of individual phone calls.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 bg-slate-100 px-3 py-2 rounded-xl border border-slate-200 text-xs">
                <span className="text-slate-500 font-medium">Viewing:</span>
                <select
                  aria-label="Select Resident for Family View"
                  value={selectedFamilyResidentId}
                  onChange={(e) => setSelectedFamilyResidentId(e.target.value)}
                  className="bg-transparent font-bold text-slate-900 focus:outline-none cursor-pointer"
                >
                  {residents.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name} ({r.room})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Daily Reassurance Banner */}
            <div className={`rounded-3xl p-6 sm:p-8 border-2 transition-all ${
              isOk 
                ? 'bg-gradient-to-br from-emerald-50 to-teal-50/50 border-emerald-300 shadow-xs'
                : resident.status === 'not_ok'
                ? 'bg-rose-50 border-rose-300'
                : 'bg-amber-50 border-amber-300'
            }`}>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                  <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shadow-md ${
                    isOk ? 'bg-emerald-600 text-white' : resident.status === 'not_ok' ? 'bg-rose-600 text-white' : 'bg-amber-500 text-slate-900'
                  }`}>
                    {isOk && <CheckCircle2 className="w-10 h-10" />}
                    {resident.status === 'not_ok' && <Heart className="w-10 h-10" />}
                    {resident.status === 'overdue' && <Calendar className="w-10 h-10" />}
                    {resident.status === 'awaiting' && <Calendar className="w-10 h-10" />}
                  </div>

                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                      Today&apos;s Morning Status
                    </span>
                    <h3 className="text-2xl sm:text-3xl font-black text-slate-900">
                      {isOk 
                        ? `${resident.name.split(' ')[0]} is Safe & Checked In`
                        : resident.status === 'not_ok'
                        ? `${resident.name.split(' ')[0]} Requested Assistance`
                        : `${resident.name.split(' ')[0]} is Pending Morning Check`}
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-600 mt-1">
                      {isOk 
                        ? `Check-in recorded at ${resident.checkInTime || '08:14 AM'}. All clear at ${selectedHome.name}.`
                        : resident.status === 'not_ok'
                        ? `Assistance alert dispatched to duty nurse ${resident.caregiver}.`
                        : `Morning cutoff is ${selectedHome.cutoffTime} AM. Staff will perform window check if not responded.`}
                    </p>
                  </div>
                </div>

                <div className="bg-white/90 backdrop-blur-xs px-4 py-3 rounded-2xl border border-slate-200 text-center sm:text-right shrink-0 shadow-xs">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                    Room Location
                  </span>
                  <span className="text-base font-extrabold text-slate-800">
                    {resident.room}
                  </span>
                  <span className="text-xs text-slate-500 block">
                    {resident.wing}
                  </span>
                </div>
              </div>

              {/* 7-Day Peace-of-Mind Track */}
              <div className="mt-8 pt-6 border-t border-slate-200/80">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-3">
                  Past 7 Days Reassurance History
                </h4>
                <div className="grid grid-cols-7 gap-2">
                  {historyList.map((h, i) => (
                    <div 
                      key={i} 
                      className={`p-2.5 rounded-xl text-center border ${
                        h.status === 'ok' 
                          ? 'bg-emerald-100/70 border-emerald-300 text-emerald-950' 
                          : h.status === 'not_ok' 
                          ? 'bg-rose-100 border-rose-300 text-rose-950' 
                          : 'bg-slate-100 border-slate-200 text-slate-600'
                      }`}
                    >
                      <div className="text-[11px] font-bold">{h.day}</div>
                      <div className="text-xs font-black my-0.5">
                        {h.status === 'ok' ? '✓ OK' : h.status === 'not_ok' ? '! Help' : '—'}
                      </div>
                      <div className="text-[10px] opacity-75">{h.time ? h.time.split(' ')[0] : '—'}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Notification settings for family */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs">
              <h4 className="text-sm font-extrabold text-slate-900 mb-4 flex items-center gap-2">
                <Bell className="w-4 h-4 text-emerald-600" />
                <span>Family Morning Notification Settings</span>
              </h4>

              <div className="space-y-3">
                <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                  <div>
                    <div className="text-xs font-bold text-slate-800">Morning Peace-of-Mind SMS</div>
                    <div className="text-[11px] text-slate-500">
                      Receive instant SMS to {resident.emergencyContact.phone} as soon as {resident.name.split(' ')[0]} taps &quot;I&apos;m okay&quot;.
                    </div>
                  </div>
                  <button
                    onClick={() => setSmsAlertEnabled(!smsAlertEnabled)}
                    className={`w-12 h-7 rounded-full transition-colors relative ${
                      smsAlertEnabled ? 'bg-emerald-600' : 'bg-slate-300'
                    }`}
                  >
                    <div className={`w-5 h-5 rounded-full bg-white absolute top-1 transition-transform ${
                      smsAlertEnabled ? 'left-6' : 'left-1'
                    }`} />
                  </button>
                </div>

                <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                  <div>
                    <div className="text-xs font-bold text-slate-800">Automatic Cutoff Missed Alert</div>
                    <div className="text-[11px] text-slate-500">
                      If {resident.name.split(' ')[0]} has not responded by {selectedHome.cutoffTime} AM, trigger notification once door-check is conducted.
                    </div>
                  </div>
                  <span className="text-xs font-extrabold text-emerald-700 px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200">
                    Always On
                  </span>
                </div>
              </div>
            </div>

          </div>

          {/* Side Info: Care Facility Contacts (1 Col) */}
          <div className="space-y-6">
            
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs">
              <h4 className="text-sm font-extrabold text-slate-900 mb-3 flex items-center gap-2">
                <Building className="w-4 h-4 text-slate-600" />
                <span>Care Facility Contacts</span>
              </h4>
              <p className="text-xs text-slate-500 mb-4 leading-relaxed">
                Direct contacts for {selectedHome.name}. Routine checks happen daily from 07:00 AM to {selectedHome.cutoffTime} AM.
              </p>

              <div className="space-y-2.5 text-xs">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-slate-400 block text-[11px]">Primary Duty Sister</span>
                  <span className="font-bold text-slate-800">{selectedHome.primaryNurse}</span>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-slate-400 block text-[11px]">Assigned Carer</span>
                  <span className="font-bold text-slate-800">{resident.caregiver}</span>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-slate-400 block text-[11px]">Facility Care Desk Hotline</span>
                  <span className="font-mono font-bold text-slate-800">+27 11 849 5000</span>
                </div>
              </div>

              <a
                href="tel:0118495000"
                className="mt-4 w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center gap-2 transition"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>Call Care Station Desk</span>
              </a>
            </div>

            <div className="bg-slate-900 text-slate-100 rounded-3xl p-6 shadow-xs border border-slate-800">
              <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold mb-2">
                <ShieldCheck className="w-4 h-4" />
                <span>No Hardware Required</span>
              </div>
              <h4 className="text-base font-black text-white">Why Families Love ElderWatch</h4>
              <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">
                No expensive emergency pendants to remember to charge or wear in the shower.
                Runs directly on their existing phone with two massive buttons.
              </p>
            </div>

          </div>

        </div>
      ) : (
        /* ================= 4TIFY / SECURITY PROVIDER HUB ================= */
        <div className="space-y-6">
          
          {/* Provider Value Proposition Banner */}
          <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-xl">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div className="max-w-2xl">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    B2B Security & Care Add-On
                  </span>
                  <span className="text-xs text-slate-400">Turnkey Integration for 4TIFY SECURITY</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-black tracking-tight mt-2">
                  Bundle Daily Reassurance into Existing Security Contracts
                </h2>
                <p className="text-xs sm:text-sm text-slate-300 mt-2 leading-relaxed">
                  For security and care-service providers like <strong>4TIFY SECURITY</strong>: offer residential estates, frail-care facilities, and retirement villages a daily reassurance layer with zero specialized hardware, zero gateway installations, and seamless integration into 24/7 central dispatch.
                </p>
              </div>

              <div className="bg-slate-800/90 p-5 rounded-2xl border border-slate-700 text-center shrink-0">
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Morning Verification SLA
                </div>
                <div className="text-3xl font-black text-emerald-400 font-mono mt-1">
                  99.8%
                </div>
                <div className="text-[11px] text-slate-400 mt-1">
                  Across 12 contracted facilities
                </div>
              </div>
            </div>
          </div>

          {/* Provider Metrics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs">
              <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Contracted Facilities</div>
              <div className="text-3xl font-black text-slate-900 mt-1">12</div>
              <div className="text-[11px] text-slate-500 mt-1">Gated estates & frail care</div>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs">
              <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Monitored Residents</div>
              <div className="text-3xl font-black text-slate-900 mt-1">480</div>
              <div className="text-[11px] text-slate-500 mt-1">Active daily morning checks</div>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs">
              <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Hardware Cost per Unit</div>
              <div className="text-3xl font-black text-emerald-600 mt-1">R 0.00</div>
              <div className="text-[11px] text-emerald-700 font-bold mt-1">Zero hardware deployment</div>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs">
              <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Staff Time Saved</div>
              <div className="text-3xl font-black text-slate-900 mt-1">~58 min</div>
              <div className="text-[11px] text-slate-500 mt-1">Per estate every single morning</div>
            </div>
          </div>

          {/* 4tify Control Room Escalation Protocol */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-xs">
            <h3 className="text-lg font-black text-slate-900 mb-2 flex items-center gap-2">
              <Radio className="w-5 h-5 text-emerald-600" />
              <span>4TIFY Central Dispatch Escalation Flow</span>
            </h3>
            <p className="text-xs text-slate-500 mb-6 max-w-2xl">
              When an estate contracts 4TIFY, morning exceptions seamlessly feed directly into the security control room console:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col justify-between">
                <div>
                  <span className="w-7 h-7 rounded-full bg-slate-900 text-white font-bold text-xs flex items-center justify-center mb-3">
                    1
                  </span>
                  <h4 className="font-extrabold text-sm text-slate-900">07:00 – 09:15 AM</h4>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                    Seniors tap green &quot;I&apos;m okay&quot; on their phones. Dashboard turns green in real time without staff interaction.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-200 text-[11px] font-bold text-emerald-700">
                  92% automatic resolution
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col justify-between">
                <div>
                  <span className="w-7 h-7 rounded-full bg-amber-500 text-slate-950 font-bold text-xs flex items-center justify-center mb-3">
                    2
                  </span>
                  <h4 className="font-extrabold text-sm text-slate-900">09:15 AM Cutoff Trigger</h4>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                    Unchecked residents are auto-flagged into the triage queue. Care staff focuses strictly on the 2–3 exceptions.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-200 text-[11px] font-bold text-amber-700">
                  Targeted door checks only
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col justify-between">
                <div>
                  <span className="w-7 h-7 rounded-full bg-rose-600 text-white font-bold text-xs flex items-center justify-center mb-3">
                    3
                  </span>
                  <h4 className="font-extrabold text-sm text-slate-900">SOS or Unreachable Escalation</h4>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                    If &quot;I Need Help&quot; is tapped or door-check indicates an emergency, 4TIFY armed/paramedic unit is dispatched immediately.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-200 text-[11px] font-bold text-rose-700">
                  Immediate rapid response
                </div>
              </div>
            </div>
          </div>

        </div>
      )}

    </div>
  );
};
