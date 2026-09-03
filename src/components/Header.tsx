import React, { useState } from 'react';
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
  Database,
  BookOpen,
  Building2,
  Menu,
  X,
  LogOut,
  UserCog
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
  onOpenGuideModal?: () => void;
  isDbConnected?: boolean;
  staff?: any;
  onLogout?: () => void;
  onOpenStaffManagement?: () => void;
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
  onOpenGuideModal,
  isDbConnected = true,
  staff,
  onLogout,
  onOpenStaffManagement,
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const attentionCount = urgentCount + overdueCount;

  return (
    <>
      {/* TOP DESKTOP & MOBILE HEADER */}
      <header className="sticky top-0 z-40 bg-slate-900 text-slate-100 backdrop-blur-md border-b border-slate-800 shadow-md">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16 gap-2 sm:gap-4">
            
            {/* Logo & Brand */}
            <div className="flex items-center gap-2 sm:gap-3">
              <Logo className="w-8 h-8 sm:w-10 sm:h-10 drop-shadow-md shrink-0" />
              <div>
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <span className="font-bold text-base sm:text-xl tracking-tight text-white">ElderWatch</span>
                  <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    Morning Care
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 hidden sm:block">
                  Zero-hardware senior morning reassurance protocol
                </p>
              </div>
            </div>

            {/* Mobile facility indicator / Desktop selector */}
            <div className="flex items-center gap-1.5 sm:gap-2.5">
              
              {/* Facility Selector */}
              <div className="relative flex items-center gap-1.5 bg-slate-800 px-2.5 py-1.5 rounded-xl border border-slate-700 text-xs">
                <Building2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <select
                  id="facility-select"
                  aria-label="Select Care Home Facility"
                  value={selectedHome.id}
                  onChange={(e) => setSelectedHomeId(e.target.value)}
                  className="bg-transparent text-slate-100 font-semibold focus:outline-none cursor-pointer text-xs max-w-[120px] sm:max-w-[190px] truncate"
                >
                  {allHomes.map((home) => (
                    <option key={home.id} value={home.id} className="bg-slate-800 text-slate-100">
                      {home.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Time badge */}
              <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-slate-300">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span className="font-mono font-medium">{currentTimeStr}</span>
              </div>

              {/* Workflow Guide Button (Desktop & Mobile) */}
              {onOpenGuideModal && (
                <button
                  onClick={onOpenGuideModal}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 border border-indigo-500/40 text-xs font-semibold transition"
                  title="View complete Workflow & Mobile Guide"
                >
                  <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
                  <span className="hidden md:inline">Workflow Guide</span>
                  <span className="md:hidden text-[11px]">Guide</span>
                </button>
              )}

              {/* Staff Management Button */}
              {onOpenStaffManagement && (
                <button
                  onClick={onOpenStaffManagement}
                  className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-semibold transition"
                  title="Manage staff and admins"
                >
                  <UserCog className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Staff</span>
                </button>
              )}

              {/* Firebase Database Status Badge */}
              {onOpenDbModal && (
                <button
                  id="firebase-db-status-btn"
                  onClick={onOpenDbModal}
                  className="flex items-center gap-1.5 px-2 sm:px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs transition"
                  title="View Firebase Firestore status"
                >
                  <Database className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="hidden lg:inline font-mono text-[11px]">Firestore</span>
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                </button>
              )}

              {/* Simulation controls */}
              <button
                id="simulate-scenarios-btn"
                onClick={onOpenSimModal}
                className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 text-xs font-semibold transition"
                title="Test real-time checkin scenarios"
              >
                <Sliders className="w-3.5 h-3.5" />
                <span className="hidden lg:inline">Simulate</span>
              </button>

              <button
                id="reset-demo-btn"
                onClick={onResetData}
                className="p-1.5 sm:p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 border border-slate-700 transition"
                title="Reset morning state"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>

              {/* Staff info + logout */}
              {staff?.email && (
                <div className="hidden md:flex items-center gap-2 text-xs text-slate-300">
                  <span className="font-mono">{staff.email}</span>
                  {onLogout && (
                    <button
                      onClick={onLogout}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
                      title="Logout"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* DESKTOP VIEW MODE SWITCHER (HIDDEN ON MOBILE, USES BOTTOM BAR INSTEAD) */}
          <div className="hidden md:flex items-center gap-2 overflow-x-auto py-2.5 border-t border-slate-800 scrollbar-none">
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
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all ${
                activeTab === 'senior-checkin'
                  ? 'bg-emerald-600 text-white shadow-sm ring-2 ring-emerald-400'
                  : 'text-emerald-300 hover:bg-emerald-950/40 border border-emerald-500/30'
              }`}
            >
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>Senior Check-In Screen</span>
              <span className="px-1.5 py-0.5 rounded text-[10px] bg-emerald-500/20 text-emerald-200 font-bold">
                Yes / No Buttons
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
              <span>Phone Simulator</span>
            </button>

            <button
              id="tab-resident-login"
              onClick={() => setActiveTab('resident-login')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all ${
                activeTab === 'resident-login'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Smartphone className="w-4 h-4" />
              <span>Resident login</span>
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
              <span>Families & 4TIFY</span>
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
              <span>Architecture Review</span>
            </button>
          </div>
        </div>
      </header>

      {/* MOBILE BOTTOM NAVIGATION BAR (FIXED ON SMARTPHONE VIEWPORTS) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-950/95 backdrop-blur-md border-t border-slate-800 shadow-2xl px-1.5 py-2 flex items-center justify-around text-slate-400">
        
        {/* Tab: Staff Dashboard */}
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`flex flex-col items-center gap-1 py-1 px-2 rounded-xl transition relative ${
            activeTab === 'dashboard' ? 'text-emerald-400 font-bold' : 'hover:text-slate-200'
          }`}
        >
          <Activity className="w-5 h-5" />
          <span className="text-[10px] tracking-tight">Staff Triage</span>
          {attentionCount > 0 && (
            <span className="absolute top-0 right-1 w-4 h-4 rounded-full bg-rose-600 text-white text-[9px] font-bold flex items-center justify-center animate-pulse">
              {attentionCount}
            </span>
          )}
        </button>

        {/* Tab: Senior Check-In (HIGHLIGHTED) */}
        <button
          onClick={() => setActiveTab('senior-checkin')}
          className={`flex flex-col items-center gap-1 py-1 px-3 rounded-2xl transition border ${
            activeTab === 'senior-checkin'
              ? 'bg-emerald-600 text-white font-black border-emerald-400 shadow-md shadow-emerald-600/30 ring-2 ring-emerald-500/40'
              : 'bg-emerald-950/70 text-emerald-300 border-emerald-600/40 hover:bg-emerald-900/80'
          }`}
        >
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-300 animate-ping"></span>
            <span className="text-[11px] font-extrabold uppercase">Senior View</span>
          </div>
          <span className="text-[9px] font-semibold text-emerald-100">Yes/No Buttons</span>
        </button>

        {/* Tab: Resident login */}
        <button
          onClick={() => setActiveTab('resident-login')}
          className={`flex flex-col items-center gap-1 py-1 px-2 rounded-xl transition ${
            activeTab === 'resident-login' ? 'text-emerald-400 font-bold' : 'hover:text-slate-200'
          }`}
        >
          <Smartphone className="w-5 h-5" />
          <span className="text-[10px] tracking-tight">Resident login</span>
        </button>

        {/* Tab: Phone Simulator */}
        <button
          onClick={() => setActiveTab('resident-phone')}
          className={`flex flex-col items-center gap-1 py-1 px-2 rounded-xl transition ${
            activeTab === 'resident-phone' ? 'text-emerald-400 font-bold' : 'hover:text-slate-200'
          }`}
        >
          <Smartphone className="w-5 h-5" />
          <span className="text-[10px] tracking-tight">Simulator</span>
        </button>

        {/* Tab: Family & 4TIFY */}
        <button
          onClick={() => setActiveTab('family-provider')}
          className={`flex flex-col items-center gap-1 py-1 px-2 rounded-xl transition ${
            activeTab === 'family-provider' ? 'text-emerald-400 font-bold' : 'hover:text-slate-200'
          }`}
        >
          <Users className="w-5 h-5" />
          <span className="text-[10px] tracking-tight">Families</span>
        </button>

        {/* Tab: Workflow Guide */}
        {onOpenGuideModal && (
          <button
            onClick={onOpenGuideModal}
            className="flex flex-col items-center gap-1 py-1 px-2 rounded-xl text-indigo-300 hover:text-indigo-100 transition"
          >
            <BookOpen className="w-5 h-5" />
            <span className="text-[10px] tracking-tight font-semibold">Guide</span>
          </button>
        )}
      </nav>
    </>
  );
};
