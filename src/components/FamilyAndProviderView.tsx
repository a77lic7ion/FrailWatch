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
        <div className="bg-[#141d27]/80 p-1.5 rounded-2xl flex flex-col sm:flex-row items-center gap-1.5 sm:gap-2 border border-[#223040]/70 shadow-xs w-full sm:w-auto">
          <button
            onClick={() => setActiveSubTab('family')}
            className={`w-full sm:w-auto flex items-center justify-center gap-2 px-4 sm:px-5 py-2.5 rounded-xl text-xs sm:text-sm font-extrabold transition-all ${
              activeSubTab === 'family'
                ? 'bg-[#0f1722] text-[#e2e8f0] shadow-sm border border-[#1e293b]'
                : 'text-[#cbd5e1] hover:text-[#e2e8f0]'
            }`}
          >
            <Heart className="w-4 h-4 text-rose-500" />
            <span>Family Reassurance Portal</span>
          </button>

          <button
            onClick={() => setActiveSubTab('4tify')}
            className={`w-full sm:w-auto flex items-center justify-center gap-2 px-4 sm:px-5 py-2.5 rounded-xl text-xs sm:text-sm font-extrabold transition-all ${
              activeSubTab === '4tify'
                ? 'bg-[#0f1722] text-[#e2e8f0] shadow-sm'
                : 'text-[#cbd5e1] hover:text-[#e2e8f0]'
            }`}
          >
            <Shield className="w-4 h-4 text-emerald-400" />
            <span>4TIFY Care Provider Hub</span>
          </button>
        </div>
      </div>

      {activeSubTab === 'family' ? (
        /* ================= FAMILY PORTAL ================= */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Main Reassurance Hero Card (2 Cols) */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Header & Resident Selector */}
            <div className="bg-[#0f1722] rounded-3xl p-6 border border-[#1e293b] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3.5">
                <Logo className="w-10 h-10 mt-1 drop-shadow-xs" />
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/20 px-2.5 py-0.5 rounded-full border border-emerald-500/30">
                    Morning Peace of Mind
                  </span>
                  <h2 className="text-2xl font-black text-[#e2e8f0] tracking-tight mt-1">
                    Family Loved One Check-In
                  </h2>
                  <p className="text-xs text-[#cbd5e1] mt-0.5">
                    Know your loved one is safe every morning, without the home needing to make dozens of individual phone calls.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 bg-[#141d27] px-3 py-2 rounded-xl border border-[#1e293b] text-xs">
                <span className="text-[#cbd5e1] font-medium">Viewing:</span>
                <select
                  aria-label="Select Resident for Family View"
                  value={selectedFamilyResidentId}
                  onChange={(e) => setSelectedFamilyResidentId(e.target.value)}
                  className="bg-transparent font-bold text-[#e2e8f0] focus:outline-none cursor-pointer"
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
                ? 'bg-gradient-to-br from-emerald-50 to-teal-50/50 border-emerald-500/40 shadow-xs'
                : resident.status === 'not_ok'
                ? 'bg-rose-500/15 border-rose-500/40'
                : 'bg-amber-500/10 border-amber-500/40'
            }`}>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                  <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shadow-md ${
                    isOk ? 'bg-emerald-600 text-[#e2e8f0]' : resident.status === 'not_ok' ? 'bg-rose-600 text-[#e2e8f0]' : 'bg-amber-500/100 text-[#e2e8f0]'
                  }`}>
                    {isOk && <CheckCircle2 className="w-10 h-10" />}
                    {resident.status === 'not_ok' && <Heart className="w-10 h-10" />}
                    {resident.status === 'overdue' && <Calendar className="w-10 h-10" />}
                    {resident.status === 'awaiting' && <Calendar className="w-10 h-10" />}
                  </div>

                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-[#cbd5e1]">
                      Today&apos;s Morning Status
                    </span>
                    <h3 className="text-2xl sm:text-3xl font-black text-[#e2e8f0]">
                      {isOk 
                        ? `${resident.name.split(' ')[0]} is Safe & Checked In`
                        : resident.status === 'not_ok'
                        ? `${resident.name.split(' ')[0]} Requested Assistance`
                        : `${resident.name.split(' ')[0]} is Pending Morning Check`}
                    </h3>
                    <p className="text-xs sm:text-sm text-[#cbd5e1] mt-1">
                      {isOk 
                        ? `Check-in recorded at ${resident.checkInTime || '08:14 AM'}. All clear at ${selectedHome.name}.`
                        : resident.status === 'not_ok'
                        ? `Assistance alert dispatched to duty nurse ${resident.caregiver}.`
                        : `Morning cutoff is ${selectedHome.cutoffTime} AM. Staff will perform window check if not responded.`}
                    </p>
                  </div>
                </div>

                <div className="bg-[#0f1722]/90 backdrop-blur-xs px-4 py-3 rounded-2xl border border-[#1e293b] text-center sm:text-right shrink-0 shadow-xs">
                  <span className="text-[11px] font-bold text-[#cbd5e1] uppercase tracking-wider block">
                    Room Location
                  </span>
                  <span className="text-base font-extrabold text-[#e2e8f0]">
                    {resident.room}
                  </span>
                  <span className="text-xs text-[#cbd5e1] block">
                    {resident.wing}
                  </span>
                </div>
              </div>

              {/* 7-Day Peace-of-Mind Track */}
              <div className="mt-8 pt-6 border-t border-[#1e293b]/80">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#cbd5e1] mb-3">
                  Past 7 Days Reassurance History
                </h4>
                <div className="grid grid-cols-7 gap-2">
                  {historyList.map((h, i) => (
                    <div 
                      key={i} 
                      className={`p-2.5 rounded-xl text-center border ${
                        h.status === 'ok' 
                          ? 'bg-emerald-500/25/70 border-emerald-500/40 text-emerald-950' 
                          : h.status === 'not_ok' 
                          ? 'bg-rose-500/25 border-rose-500/40 text-rose-950' 
                          : 'bg-[#141d27] border-[#1e293b] text-[#cbd5e1]'
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
            <div className="bg-[#0f1722] rounded-3xl p-6 border border-[#1e293b] shadow-xs">
              <h4 className="text-sm font-extrabold text-[#e2e8f0] mb-4 flex items-center gap-2">
                <Bell className="w-4 h-4 text-emerald-400" />
                <span>Family Morning Notification Settings</span>
              </h4>

              <div className="space-y-3">
                <div className="flex items-center justify-between p-3.5 rounded-2xl bg-[#0f1722] border border-[#1e293b]">
                  <div>
                    <div className="text-xs font-bold text-[#e2e8f0]">Automatic Cutoff Missed Alert</div>
                    <div className="text-[11px] text-[#cbd5e1]">
                      If {resident.name.split(' ')[0]} has not responded by {selectedHome.cutoffTime} AM, trigger notification once door-check is conducted.
                    </div>
                  </div>
                  <span className="text-xs font-extrabold text-emerald-400 px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/30">
                    Always On
                  </span>
                </div>
              </div>
            </div>

          </div>

          {/* Side Info: Care Facility Contacts (1 Col) */}
          <div className="space-y-6">
            
            <div className="bg-[#0f1722] rounded-3xl p-6 border border-[#1e293b] shadow-xs">
              <h4 className="text-sm font-extrabold text-[#e2e8f0] mb-3 flex items-center gap-2">
                <Building className="w-4 h-4 text-[#cbd5e1]" />
                <span>Care Facility Contacts</span>
              </h4>
              <p className="text-xs text-[#cbd5e1] mb-4 leading-relaxed">
                Direct contacts for {selectedHome.name}. Routine checks happen daily from 07:00 AM to {selectedHome.cutoffTime} AM.
              </p>

              <div className="space-y-2.5 text-xs">
                <div className="p-3 rounded-xl bg-[#0f1722] border border-[#1e293b]">
                  <span className="text-[#cbd5e1] block text-[11px]">Primary Duty Sister</span>
                  <span className="font-bold text-[#e2e8f0]">{selectedHome.primaryNurse}</span>
                </div>

                <div className="p-3 rounded-xl bg-[#0f1722] border border-[#1e293b]">
                  <span className="text-[#cbd5e1] block text-[11px]">Assigned Carer</span>
                  <span className="font-bold text-[#e2e8f0]">{resident.caregiver}</span>
                </div>

                <div className="p-3 rounded-xl bg-[#0f1722] border border-[#1e293b]">
                  <span className="text-[#cbd5e1] block text-[11px]">Facility Care Desk Hotline</span>
                  <span className="font-mono font-bold text-[#e2e8f0]">+27 11 849 5000</span>
                </div>
              </div>

              <a
                href="tel:0118495000"
                className="mt-4 w-full py-2.5 rounded-xl bg-[#0f1722] hover:bg-[#131d27] text-[#e2e8f0] font-bold text-xs flex items-center justify-center gap-2 transition"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>Call Care Station Desk</span>
              </a>
            </div>

            <div className="bg-[#0f1722] text-[#e2e8f0] rounded-3xl p-6 shadow-xs border border-[#223040]">
              <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold mb-2">
                <ShieldCheck className="w-4 h-4" />
                <span>No Hardware Required</span>
              </div>
              <h4 className="text-base font-black text-[#e2e8f0]">Why Families Love ElderWatch</h4>
              <p className="text-xs text-[#e2e8f0] mt-1.5 leading-relaxed">
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
          <div className="bg-[#0f1722] text-[#e2e8f0] rounded-3xl p-6 sm:p-8 border border-[#223040] shadow-xl">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div className="max-w-2xl">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-500/200/20 text-emerald-300 border border-emerald-500/30">
                    B2B Security & Care Add-On
                  </span>
                  <span className="text-xs text-[#cbd5e1]">Turnkey Integration for 4TIFY SECURITY</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-black tracking-tight mt-2">
                  Bundle Daily Reassurance into Existing Security Contracts
                </h2>
                <p className="text-xs sm:text-sm text-[#e2e8f0] mt-2 leading-relaxed">
                  For security and care-service providers like <strong>4TIFY SECURITY</strong>: offer residential estates, frail-care facilities, and retirement villages a daily reassurance layer with zero specialized hardware, zero gateway installations, and seamless integration into 24/7 central dispatch.
                </p>
              </div>

              <div className="bg-[#131d27]/90 p-5 rounded-2xl border border-[#223040] text-center shrink-0">
                <div className="text-xs font-bold text-[#cbd5e1] uppercase tracking-wider">
                  Morning Verification SLA
                </div>
                <div className="text-3xl font-black text-emerald-400 font-mono mt-1">
                  99.8%
                </div>
                <div className="text-[11px] text-[#cbd5e1] mt-1">
                  Across 12 contracted facilities
                </div>
              </div>
            </div>
          </div>

          {/* Provider Metrics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-[#0f1722] rounded-2xl p-5 border border-[#1e293b] shadow-2xs">
              <div className="text-xs font-bold text-[#cbd5e1] uppercase tracking-wider">Contracted Facilities</div>
              <div className="text-3xl font-black text-[#e2e8f0] mt-1">12</div>
              <div className="text-[11px] text-[#cbd5e1] mt-1">Gated estates & frail care</div>
            </div>

            <div className="bg-[#0f1722] rounded-2xl p-5 border border-[#1e293b] shadow-2xs">
              <div className="text-xs font-bold text-[#cbd5e1] uppercase tracking-wider">Monitored Residents</div>
              <div className="text-3xl font-black text-[#e2e8f0] mt-1">480</div>
              <div className="text-[11px] text-[#cbd5e1] mt-1">Active daily morning checks</div>
            </div>

            <div className="bg-[#0f1722] rounded-2xl p-5 border border-[#1e293b] shadow-2xs">
              <div className="text-xs font-bold text-[#cbd5e1] uppercase tracking-wider">Hardware Cost per Unit</div>
              <div className="text-3xl font-black text-emerald-400 mt-1">R 0.00</div>
              <div className="text-[11px] text-emerald-400 font-bold mt-1">Zero hardware deployment</div>
            </div>

            <div className="bg-[#0f1722] rounded-2xl p-5 border border-[#1e293b] shadow-2xs">
              <div className="text-xs font-bold text-[#cbd5e1] uppercase tracking-wider">Staff Time Saved</div>
              <div className="text-3xl font-black text-[#e2e8f0] mt-1">~58 min</div>
              <div className="text-[11px] text-[#cbd5e1] mt-1">Per estate every single morning</div>
            </div>
          </div>

          {/* 4tify Control Room Escalation Protocol */}
          <div className="bg-[#0f1722] rounded-3xl p-6 sm:p-7 border border-[#1e293b] shadow-xs">
            <h3 className="text-lg font-black text-[#e2e8f0] mb-2 flex items-center gap-2">
              <Radio className="w-5 h-5 text-emerald-400" />
              <span>4TIFY Central Dispatch Escalation Flow</span>
            </h3>
            <p className="text-xs text-[#cbd5e1] mb-6 max-w-2xl">
              When an estate contracts 4TIFY, morning exceptions seamlessly feed directly into the security control room console:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-5 rounded-2xl bg-[#0f1722] border border-[#1e293b] flex flex-col justify-between">
                <div>
                  <span className="w-7 h-7 rounded-full bg-[#0f1722] text-[#e2e8f0] font-bold text-xs flex items-center justify-center mb-3">
                    1
                  </span>
                  <h4 className="font-extrabold text-sm text-[#e2e8f0]">07:00 – 09:15 AM</h4>
                  <p className="text-xs text-[#cbd5e1] mt-1 leading-relaxed">
                    Seniors tap green &quot;I&apos;m okay&quot; on their phones. Dashboard turns green in real time without staff interaction.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-[#1e293b] text-[11px] font-bold text-emerald-400">
                  92% automatic resolution
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-[#0f1722] border border-[#1e293b] flex flex-col justify-between">
                <div>
                  <span className="w-7 h-7 rounded-full bg-amber-500/100 text-[#e2e8f0] font-bold text-xs flex items-center justify-center mb-3">
                    2
                  </span>
                  <h4 className="font-extrabold text-sm text-[#e2e8f0]">09:15 AM Cutoff Trigger</h4>
                  <p className="text-xs text-[#cbd5e1] mt-1 leading-relaxed">
                    Unchecked residents are auto-flagged into the triage queue. Care staff focuses strictly on the 2–3 exceptions.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-[#1e293b] text-[11px] font-bold text-amber-400">
                  Targeted door checks only
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-[#0f1722] border border-[#1e293b] flex flex-col justify-between">
                <div>
                  <span className="w-7 h-7 rounded-full bg-rose-600 text-[#e2e8f0] font-bold text-xs flex items-center justify-center mb-3">
                    3
                  </span>
                  <h4 className="font-extrabold text-sm text-[#e2e8f0]">SOS or Unreachable Escalation</h4>
                  <p className="text-xs text-[#cbd5e1] mt-1 leading-relaxed">
                    If &quot;I Need Help&quot; is tapped or door-check indicates an emergency, 4TIFY armed/paramedic unit is dispatched immediately.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-[#1e293b] text-[11px] font-bold text-rose-400">
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
