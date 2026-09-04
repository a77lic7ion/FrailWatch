import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Activity, 
  Clock, 
  RefreshCw,
  Bell,
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
  selectedHome?: CareHome;
  allHomes?: CareHome[];
  setSelectedHomeId: (id: string) => void;
  currentTimeStr: string;
  urgentCount: number;
  overdueCount: number;
  onResetData: () => void;
  onOpenGuideModal?: () => void;
  isDbConnected?: boolean;
  staff?: any;
  onLogout?: () => void;
  onOpenStaffManagement?: () => void;
  onOpenHomeManagement?: () => void;
  onOpenDbVerify?: () => void;
  dbStatus?: any;
  onMobileHomeClick?: () => void;
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
  onResetData,
  onOpenGuideModal,
  isDbConnected,
  staff,
  onLogout,
  onOpenStaffManagement,
  onOpenHomeManagement,
  onOpenDbVerify,
  dbStatus,
  onMobileHomeClick,
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const attentionCount = urgentCount + overdueCount;

  return (
    <>
      {/* TOP DESKTOP & MOBILE HEADER */}
      <header className="sticky top-0 z-40 bg-[#0f1722] text-[#e2e8f0] backdrop-blur-md border-b border-[#223040] shadow-md">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16 gap-2 sm:gap-4">
            
            {/* Logo & Brand */}
            <div className="flex items-center gap-2 sm:gap-3">
              <Logo className="w-8 h-8 sm:w-10 sm:h-10 drop-shadow-md shrink-0" />
              <div>
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <span className="font-bold text-base sm:text-xl tracking-tight text-[#e2e8f0]">ElderWatch</span>
                  <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-md bg-emerald-500/200/10 text-emerald-400 border border-emerald-500/20">
                    Morning Care
                  </span>
                </div>
                <p className="text-[11px] text-[#94a3b8] hidden sm:block">
                  Zero-hardware senior morning reassurance protocol
                </p>
              </div>
            </div>

            {/* Mobile facility indicator / Desktop selector */}
            <div className="flex items-center gap-1.5 sm:gap-2.5">
              
              {/* Facility Selector */}
              {(() => {
                const isGlobal = staff?.role === 'superadmin' || staff?.homeId === '*';
                if (isGlobal) {
                  const homeOptions = allHomes || [];
                  if (homeOptions.length === 0) return null;
                  return (
                    <div className="relative flex items-center gap-1.5 bg-[#131d27] px-2.5 py-1.5 rounded-xl border border-[#223040] text-xs">
                      <Building2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <select
                        id="facility-select"
                        aria-label="Select Care Home Facility"
                        value={selectedHome?.id || ''}
                        onChange={(e) => setSelectedHomeId(e.target.value)}
                        className="bg-transparent text-[#e2e8f0] font-semibold focus:outline-none cursor-pointer text-xs max-w-[120px] sm:max-w-[190px] truncate"
                      >
                        {homeOptions.map((home) => (
                          <option key={home.id} value={home.id} className="bg-[#131d27] text-[#e2e8f0]">
                            {home.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  );
                }
                const assignedHome = (allHomes || []).find((h) => h.id === staff?.homeId) || selectedHome;
                if (!assignedHome && staff?.homeId) {
                  return (
                    <div className="flex items-center gap-1.5 bg-[#131d27] px-2.5 py-1.5 rounded-xl border border-[#223040] text-xs text-[#e2e8f0]">
                      <Building2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span className="font-semibold truncate max-w-[120px] sm:max-w-[190px]">Home: {staff.homeId}</span>
                    </div>
                  );
                }
                if (!assignedHome) return null;
                return (
                  <div className="flex items-center gap-1.5 bg-[#131d27] px-2.5 py-1.5 rounded-xl border border-[#223040] text-xs text-[#e2e8f0]">
                    <Building2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span className="font-semibold truncate max-w-[120px] sm:max-w-[190px]">{assignedHome.name}</span>
                  </div>
                );
              })()}

              {/* Time badge */}
              <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-[#131d27] border border-[#223040] text-xs text-[#e2e8f0]">
                <Clock className="w-3.5 h-3.5 text-[#94a3b8]" />
                <span className="font-mono font-medium">{currentTimeStr}</span>
              </div>

            {/* Thin status/action rail */}
            <div className="flex items-center gap-1.5 sm:gap-2">
              {/* Workflow Guide Button */}
              {onOpenGuideModal && (
                <button
                  onClick={onOpenGuideModal}
                  className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-emerald-500/100/20 hover:bg-emerald-500/100/30 text-indigo-300 border border-emerald-500/40 text-[11px] font-semibold transition"
                  title="View complete Workflow & Mobile Guide"
                >
                  <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
                  <span className="hidden md:inline">Workflow Guide</span>
                </button>
              )}

              {/* Staff Management Button */}
              {onOpenStaffManagement && (
                <button
                  onClick={onOpenStaffManagement}
                  className="hidden sm:flex items-center gap-1.5 px-2 py-1 rounded-lg bg-emerald-500/200/10 hover:bg-emerald-500/200/20 text-emerald-300 border border-emerald-500/30 text-[11px] font-semibold transition"
                  title="Manage staff and admins"
                >
                  <UserCog className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Staff</span>
                </button>
              )}

              {/* Home Management Button */}
              {onOpenHomeManagement && (
                <button
                  onClick={onOpenHomeManagement}
                  className="hidden sm:flex items-center gap-1.5 px-2 py-1 rounded-lg bg-emerald-500/100/10 hover:bg-emerald-500/100/20 text-indigo-300 border border-emerald-500/30 text-[11px] font-semibold transition"
                  title="Manage homes"
                >
                  <Building2 className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Homes</span>
                </button>
              )}

              {/* Firebase connection status indicator */}
              <span
                title={dbStatus?.error ? `Firebase error: ${dbStatus.error}` : 'Connected to Firebase'}
                className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-[#131d27] border border-[#223040] text-[11px] transition"
              >
                <span className={`w-2 h-2 rounded-full ${dbStatus?.error ? 'bg-rose-500/150' : 'bg-emerald-500/200 animate-pulse'}`}></span>
                <span className="hidden lg:inline font-mono text-[11px] text-[#e2e8f0]">
                  {dbStatus?.error ? 'Firebase error' : 'Firebase'}
                </span>
              </span>

              <button
                id="reset-demo-btn"
                onClick={onResetData}
                className="p-1.5 sm:p-2 rounded-xl bg-[#131d27] hover:bg-[#131d27] text-[#94a3b8] hover:text-[#e2e8f0] border border-[#223040] transition"
                title="Reset morning state"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>

              {onLogout && (
                <button
                  onClick={onLogout}
                  className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-rose-500/150/10 hover:bg-rose-500/150/20 text-rose-300 border border-rose-500/30 text-xs font-semibold transition"
                  title="Sign out"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign out</span>
                </button>
              )}
            </div>
          </div>
        </div>

          {/* DESKTOP VIEW MODE SWITCHER (HIDDEN ON MOBILE, USES BOTTOM BAR INSTEAD) */}
          <div className="hidden md:flex items-center gap-2 overflow-x-auto py-2.5 border-t border-[#223040] scrollbar-none">
            <button
              id="tab-dashboard"
              onClick={() => setActiveTab('dashboard')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all ${
                activeTab === 'dashboard'
                  ? 'bg-emerald-600 text-[#e2e8f0] shadow-sm'
                  : 'text-[#94a3b8] hover:bg-[#131d27] hover:text-[#e2e8f0]'
              }`}
            >
              <Activity className="w-4 h-4" />
              <span>Staff Morning Dashboard</span>
              {attentionCount > 0 && (
                <span className="ml-1 px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/150 text-[#e2e8f0] animate-pulse">
                  {attentionCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* MOBILE FOOTER (fixed, always visible) */}
      <footer className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#0f1722]/95 border-t border-[#223040] px-3 py-2 flex items-center justify-between">
        <button
          onClick={onMobileHomeClick}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#131d27] text-[#e2e8f0] text-xs font-semibold border border-[#223040]"
        >
          <Building2 className="w-4 h-4" />
          <span>Home</span>
        </button>

        {onLogout && (
          <button
            onClick={onLogout}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-600 text-[#e2e8f0] text-xs font-bold"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign out</span>
          </button>
        )}
      </footer>
    </>
  );
};
