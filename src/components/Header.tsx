import React from 'react';
import { 
  ShieldCheck, 
  Smartphone, 
  Users, 
  Sparkles, 
  Activity, 
  Clock, 
  Sliders, 
  RefreshCw,
  Bell,
  Database
} from 'lucide-react';
import { ActiveTab, CareHome } from '../types';
import { Logo } from './Logo';

interface HeaderProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  selectedHome: CareHome;
  allHomes: CareHome[];
  setSelectedHomeId: (id: string) => void;
  currentTimeStr: string;
  urgentCount: number;
  overdueCount: number;
  onOpenSimModal: () => void;
  onResetData: () => void;
  onOpenDbModal?: () => void;
  isDbConnected?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  selectedHome,
  allHomes,
  setSelectedHomeId,
  currentTimeStr,
  urgentCount,
  overdueCount,
  onOpenSimModal,
  onResetData,
  onOpenDbModal,
  isDbConnected = true,
}) => {
  const attentionCount = urgentCount + overdueCount;

  return (
    <header className="sticky top-0 z-40 bg-slate-900 text-slate-100 backdrop-blur-md border-b border-slate-800 shadow-md">
      {/* Top utility row */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <Logo className="w-10 h-10 drop-shadow-md" />
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-xl tracking-tight text-white">ElderWatch</span>
                <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Morning Care
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
                Peace of mind, every morning · Zero-hardware senior check-in
              </p>
            </div>
          </div>

          {/* Facility Selector & Live Clock & Controls */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            {/* Facility Selector */}
            <div className="relative hidden md:flex items-center gap-2 bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-700 text-xs">
              <span className="text-slate-400 font-medium">Facility:</span>
              <select
                id="facility-select"
                aria-label="Select Care Home Facility"
                value={selectedHome.id}
                onChange={(e) => setSelectedHomeId(e.target.value)}
                className="bg-transparent text-slate-100 font-semibold focus:outline-none cursor-pointer pr-3"
              >
                {allHomes.map((home) => (
                  <option key={home.id} value={home.id} className="bg-slate-800 text-slate-100">
                    {home.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Time badge */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-slate-300">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span className="font-mono font-medium">{currentTimeStr}</span>
            </div>

            {/* Firebase Database Status Badge */}
            {onOpenDbModal && (
              <button
                id="firebase-db-status-btn"
                onClick={onOpenDbModal}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs transition"
                title="View Firebase Firestore connection status (frailcare-checkin)"
              >
                <Database className="w-3.5 h-3.5 text-emerald-400" />
                <span className="hidden sm:inline font-mono text-[11px]">frailcare-checkin</span>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              </button>
            )}

            {/* Powered by 4TIFY Badge */}
            <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 bg-slate-800 rounded-xl border border-slate-700/80">
              <span className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Partner</span>
              <span className="text-xs font-bold text-white tracking-wider">4TIFY SECURITY</span>
            </div>

            {/* Simulation controls */}
            <button
              id="simulate-scenarios-btn"
              onClick={onOpenSimModal}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 text-xs font-semibold transition"
              title="Test real-time checkin scenarios and cutoff events"
            >
              <Sliders className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Simulate Events</span>
            </button>

            <button
              id="reset-demo-btn"
              onClick={onResetData}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 border border-slate-700 transition"
              title="Reset morning demo state"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Primary View Mode Switcher */}
        <div className="flex items-center gap-2 overflow-x-auto py-2.5 border-t border-slate-800 scrollbar-none">
          <button
            id="tab-dashboard"
            onClick={() => setActiveTab('dashboard')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all ${
              activeTab === 'dashboard'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <Activity className="w-4 h-4" />
            <span>Staff Morning Dashboard</span>
            {attentionCount > 0 && (
              <span className="ml-1 px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-500 text-white animate-pulse">
                {attentionCount}
              </span>
            )}
          </button>

          <button
            id="tab-senior-checkin"
            onClick={() => setActiveTab('senior-checkin')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all ${
              activeTab === 'senior-checkin'
                ? 'bg-emerald-600 text-white shadow-sm ring-2 ring-emerald-400'
                : 'text-emerald-300 hover:bg-emerald-950/40 border border-emerald-500/30'
            }`}
          >
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>Senior Check-In Website</span>
            <span className="px-1.5 py-0.5 rounded text-[10px] bg-emerald-500/20 text-emerald-200 font-bold">
              Green / Red
            </span>
          </button>

          <button
            id="tab-resident-phone"
            onClick={() => setActiveTab('resident-phone')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all ${
              activeTab === 'resident-phone'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <Smartphone className="w-4 h-4" />
            <span>Mobile Device Simulator</span>
          </button>

          <button
            id="tab-family-provider"
            onClick={() => setActiveTab('family-provider')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all ${
              activeTab === 'family-provider'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Families & 4tify Security</span>
          </button>

          <button
            id="tab-comparison"
            onClick={() => setActiveTab('comparison')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all ${
              activeTab === 'comparison'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-indigo-300 hover:bg-indigo-950/40 border border-indigo-500/30'
            }`}
          >
            <Sparkles className="w-4 h-4 text-indigo-400" />
            <span>Before vs. After Critique</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-200 font-medium">
              Layout Review
            </span>
          </button>
        </div>
      </div>
    </header>
  );
};
