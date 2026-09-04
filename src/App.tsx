import React, { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header';
import { StaffDashboard } from './components/StaffDashboard';
import { SeniorCheckInWebsite } from './components/SeniorCheckInWebsite';
import { WorkflowGuideModal } from './components/WorkflowGuideModal';
import { StaffLogin } from './components/StaffLogin';
import { StaffManagement } from './components/StaffManagement';
import { HomeManagement } from './components/HomeManagement';
import { DbVerificationModal } from './components/DbVerificationModal';
import { GlobalAdminHomeSelector } from './components/GlobalAdminHomeSelector';
import { GlobalAdminResidentList } from './components/GlobalAdminResidentList';
import { CutoffModal } from './components/CutoffModal';
import { Logo } from './components/Logo';
import { CheckCircle2, AlertTriangle } from 'lucide-react';

import { INITIAL_HOMES, INITIAL_RESIDENTS } from './data/mockData';
import { ActiveTab, CareHome, Resident, CheckInStatus } from './types';
import { api, DatabaseStatus } from './services/api';
import { onStaffAuthChange, staffLogin, staffLogout, markLoggingOut } from './services/staffAuth';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [staff, setStaff] = useState<any>(null);
  const [staffLoading, setStaffLoading] = useState<boolean>(true);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [homes, setHomes] = useState<CareHome[]>(INITIAL_HOMES);
  const [selectedHomeId, setSelectedHomeId] = useState<string>(INITIAL_HOMES[0].id);
  const [residents, setResidents] = useState<Resident[]>(INITIAL_RESIDENTS);
  const [activeResidentId, setActiveResidentId] = useState<string>(INITIAL_RESIDENTS[0]?.id || '');
  const [currentTimeStr, setCurrentTimeStr] = useState<string>('08:35 AM');
  const [isCutoffModalOpen, setIsCutoffModalOpen] = useState<boolean>(false);
  const [isGuideModalOpen, setIsGuideModalOpen] = useState<boolean>(false);
  const [isStaffMgmtOpen, setIsStaffMgmtOpen] = useState<boolean>(false);
  const [isHomeMgmtOpen, setIsHomeMgmtOpen] = useState<boolean>(false);
  const [isDbVerifyOpen, setIsDbVerifyOpen] = useState<boolean>(false);
  const [selectedGlobalHomeId, setSelectedGlobalHomeId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'admin' | 'resident'>('admin');
  const [dbStatus, setDbStatus] = useState<DatabaseStatus | null>(null);
  const [isDbRefreshing, setIsDbRefreshing] = useState<boolean>(false);
  const [residentUser, setResidentUser] = useState<Resident | null>(null);

  const isResidentLink = typeof window !== 'undefined' && (() => {
    const p = window.location.pathname || '';
    return p !== '/' && p !== '/index.html';
  })();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const path = window.location.pathname.replace(/^\/+|\/+$/g, '');
      const params = new URLSearchParams(window.location.search);
      const phone = params.get('phone');
      const urlVersion = params.get('v');
      const token = params.get('verify') || params.get('token');
      const residentId = params.get('residentId') || params.get('id');
      const lookup = path || phone || token || residentId;
      if (lookup) {
        setActiveTab('senior-checkin');
        api.getResidentProfile(lookup).then((profile) => {
          const resident = profile?.resident;
          if (resident) {
            const currentVersion = Number(resident.verificationVersion || 1);
            const expectedVersion = urlVersion ? Number(urlVersion) : currentVersion;
            const isValidVersion = !phone || currentVersion === expectedVersion;
            if (isValidVersion) {
              api.verifyResident(lookup).catch(() => {});
              setResidentUser(resident as any);
              setViewMode('resident');
              try {
                localStorage.setItem('elderwatch_linked_resident_id', resident.id);
                if (token) localStorage.setItem('elderwatch_linked_token', token);
                if (phone) localStorage.setItem('elderwatch_linked_phone', phone);
              } catch {}
            }
          }
        }).catch(() => {});
      } else if (!staff) {
        const savedId = localStorage.getItem('elderwatch_linked_resident_id');
        const savedToken = localStorage.getItem('elderwatch_linked_token');
        const savedPhone = localStorage.getItem('elderwatch_linked_phone');
        const savedLookup = savedToken || savedPhone || savedId;
        if (savedLookup) {
          api.getResidentProfile(savedLookup).then((profile) => {
            if (profile?.resident) {
              setResidentUser(profile.resident);
              setViewMode('resident');
              setActiveTab('senior-checkin');
            }
          }).catch(() => {});
        }
      }
    }
  }, [staff]);

  const logout = async () => {
    try { markLoggingOut(); await staffLogout(); } catch {}
    setStaff(null);
    setActiveTab('dashboard');
    setSelectedGlobalHomeId(null);
    setResidents([]);
    setHomes(INITIAL_HOMES);
    setStaffLoading(true);
    setViewMode('admin');
    setResidentUser(null);
  };

  useEffect(() => {
    if ('serviceWorker' in window) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js').catch(() => {});
      });
    }
  }, []);

  useEffect(() => {
    return onStaffAuthChange((s) => {
      setStaff(s);
      setStaffLoading(false);
    });
  }, []);

  const isGlobal = staff?.role === 'superadmin' || staff?.homeId === '*';
  const effectiveHomes = isGlobal ? homes : homes.filter((h) => h.id === staff?.homeId);
  const effectiveSelectedHomeId = isGlobal ? (selectedGlobalHomeId || selectedHomeId) : (effectiveHomes[0]?.id || selectedHomeId);

  useEffect(() => {
    if (!isGlobal && staff?.homeId) {
      const match = homes.find((h) => h.id === staff.homeId);
      if (match && match.id !== selectedHomeId) {
        setSelectedHomeId(match.id);
      }
    }
  }, [isGlobal, staff?.homeId, homes, selectedHomeId]);

  useEffect(() => {
    try {
      localStorage.removeItem('elderwatch_custom_firebase_config');
    } catch {}
  }, []);

  const loadDbStatus = useCallback(async () => {
    setIsDbRefreshing(true);
    try {
      const status = await api.getStatus();
      setDbStatus(status);
      const appData = await api.getData();
      if (appData) {
        const sanitizedResidents: Resident[] = (appData.residents || []).map((r: any) => ({
          ...r,
          wing: r.wing || 'Willow Cottage',
          sevenDayHistory: Array.isArray(r.sevenDayHistory) && r.sevenDayHistory.length > 0
            ? r.sevenDayHistory
            : [
                { date: '2026-08-28', day: 'Fri', status: 'ok', time: '08:10 AM' },
                { date: '2026-08-29', day: 'Sat', status: 'ok', time: '08:15 AM' },
                { date: '2026-08-30', day: 'Sun', status: 'ok', time: '08:05 AM' },
                { date: '2026-08-31', day: 'Mon', status: 'ok', time: '08:20 AM' },
                { date: '2026-09-01', day: 'Tue', status: 'ok', time: '08:12 AM' },
                { date: '2026-09-02', day: 'Wed', status: 'ok', time: '08:18 AM' },
                { date: '2026-09-03', day: 'Today', status: r.status || 'awaiting' },
              ],
          medicalAlerts: Array.isArray(r.medicalAlerts) ? r.medicalAlerts : [],
          emergencyContact: r.emergencyContact || {
            name: 'Emergency Contact',
            relationship: 'Family',
            phone: '+27 82 111 2222',
            notifyOnIssue: true,
          },
        }));
        setResidents(sanitizedResidents);
        if (appData.homes && appData.homes.length > 0) {
          setHomes(appData.homes);
        }
      }
    } catch (e) {
      console.warn('Initial data load exception:', e);
    } finally {
      setIsDbRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadDbStatus();
  }, [loadDbStatus, staff?.homeId, isGlobal]);

  const selectedHome = (effectiveHomes.find((h) => h.id === effectiveSelectedHomeId) || homes.find((h) => h.id === staff?.homeId) || effectiveHomes[0] || (homes[0] || { id: 'home-benoni-01', name: 'Default Home', location: '', cutoffTime: '09:15', careStaffOnDuty: 0, primaryNurse: '', providerPartner: '' }));
  const visibleResidents = isGlobal ? residents : residents.filter((r) => r.homeId === staff?.homeId);
  const urgentCount = visibleResidents.filter((r) => r.status === 'not_ok').length;
  const overdueCount = visibleResidents.filter((r) => r.status === 'overdue').length;

  const handleCheckIn = (residentId: string, status: CheckInStatus) => {
    const timeFormatted = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setResidents((prev) =>
      prev.map((r) => {
        if (r.id !== residentId) return r;
        const currentHistory = Array.isArray(r.sevenDayHistory) && r.sevenDayHistory.length > 0
          ? [...r.sevenDayHistory]
          : [
              { date: '2026-08-28', day: 'Fri', status: 'ok', time: '08:10 AM' },
              { date: '2026-08-29', day: 'Sat', status: 'ok', time: '08:15 AM' },
              { date: '2026-08-30', day: 'Sun', status: 'ok', time: '08:12 AM' },
              { date: '2026-08-31', day: 'Mon', status: 'ok', time: '08:20 AM' },
              { date: '2026-09-01', day: 'Tue', status: 'ok', time: '08:12 AM' },
              { date: '2026-09-02', day: 'Wed', status: 'ok', time: '08:18 AM' },
              { date: '2026-09-03', day: 'Today', status: 'awaiting' },
            ];
        currentHistory[currentHistory.length - 1] = {
          ...currentHistory[currentHistory.length - 1],
          status,
          time: status === 'awaiting' ? undefined : timeFormatted,
        };
        return { ...r, status, checkInTime: timeFormatted, sevenDayHistory: currentHistory };
      })
    );
    api.recordCheckIn(residentId, status);
  };

  const showLogin = !staff || staffLoading;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <link rel="manifest" href="/manifest.webmanifest" />
      <meta name="theme-color" content="#0f766e" />
      <Header
        activeTab={activeTab}
        onTabChange={setActiveTab}
        dbStatus={dbStatus}
        staff={staff}
        onLogout={logout}
        onOpenStaffManagement={isGlobal ? () => setIsStaffMgmtOpen(true) : undefined}
        onOpenHomeManagement={isGlobal ? () => setIsHomeMgmtOpen(true) : undefined}
        onOpenDbVerify={isGlobal ? () => setIsDbVerifyOpen(true) : undefined}
        onMobileHomeClick={() => {
          if (isGlobal) setSelectedGlobalHomeId(null);
          else setActiveTab('dashboard');
        }}
      />

      <main className="flex-1">
        {viewMode === 'resident' && activeTab === 'senior-checkin' && residentUser && (
          <div className="fixed inset-0 z-50 bg-slate-950 text-white flex items-center justify-center p-4">
            <div className="w-full max-w-md rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-2xl">
              <div className="text-center mb-5">
                <Logo className="w-12 h-12 mx-auto mb-2" />
                <h1 className="text-xl font-black">Morning Check-In</h1>
                <p className="text-xs text-slate-400 mt-1">{residentUser.name} · {residentUser.homeId || ''}</p>
                <p className="text-[11px] text-slate-500 mt-1">Room {residentUser.room || ''} · {residentUser.wing || ''}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <button
                  id="resident-ok-button"
                  type="button"
                  onClick={async () => {
                    const timeFormatted = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                    setResidentUser({ ...residentUser, status: 'ok', checkInTime: timeFormatted } as any);
                    await api.recordCheckIn(residentUser.id, 'ok', timeFormatted);
                  }}
                  className={`h-[50vh] rounded-3xl text-white font-black text-2xl shadow-2xl transition-all active:scale-95 border-4 ${
                    residentUser.status === 'ok'
                      ? 'bg-emerald-600 border-emerald-300 ring-4 ring-emerald-500/50'
                      : 'bg-emerald-600 hover:bg-emerald-500 border-emerald-400'
                  }`}
                >
                  <div className="flex flex-col items-center justify-center gap-3">
                    <CheckCircle2 className="w-16 h-16" />
                    <span>I AM OK</span>
                  </div>
                </button>
                <button
                  id="resident-help-button"
                  type="button"
                  onClick={async () => {
                    const timeFormatted = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                    setResidentUser({ ...residentUser, status: 'not_ok', checkInTime: timeFormatted } as any);
                    await api.recordCheckIn(residentUser.id, 'not_ok', timeFormatted);
                  }}
                  className={`h-[50vh] rounded-3xl text-white font-black text-2xl shadow-2xl transition-all active:scale-95 border-4 ${
                    residentUser.status === 'not_ok'
                      ? 'bg-rose-700 border-rose-400 ring-4 ring-rose-500/50'
                      : 'bg-rose-600 hover:bg-rose-500 border-rose-400'
                  }`}
                >
                  <div className="flex flex-col items-center justify-center gap-3">
                    <AlertTriangle className="w-16 h-16" />
                    <span>I NEED HELP</span>
                  </div>
                </button>
              </div>
              {residentUser.status && (
                <p className="text-center text-xs text-slate-400 mt-4">
                  Checked in at {residentUser.checkInTime || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              )}

              <button
                type="button"
                onClick={async () => {
                  if (residentUser?.id) {
                    await api.revokeResidentVerification(residentUser.id).catch(() => {});
                  }
                  try {
                    localStorage.removeItem('elderwatch_linked_resident_id');
                    localStorage.removeItem('elderwatch_linked_token');
                    localStorage.removeItem('elderwatch_linked_phone');
                  } catch {}
                  setResidentUser(null);
                  setViewMode('admin');
                }}
                className="mt-6 w-full rounded-2xl border border-slate-700 bg-slate-900/60 text-slate-300 py-3 text-sm font-semibold"
              >
                Sign out of this device
              </button>
            </div>
          </div>
        )}

        {showLogin && (
          <StaffLogin
            loading={staffLoading}
            error={loginError}
            onLogin={async (email, password) => {
              setLoginError(null);
              setStaffLoading(true);
              try {
                const result = await staffLogin(email, password);
                setStaff(result);
                setStaffLoading(false);
              } catch (err: any) {
                setStaffLoading(false);
                setLoginError(err.message || 'Login failed');
              }
            }}
          />
        )}

        {!showLogin && isGlobal && !selectedGlobalHomeId && (
          <GlobalAdminHomeSelector
            homes={effectiveHomes}
            onSelectHome={(id) => setSelectedGlobalHomeId(id)}
          />
        )}

        {!showLogin && isGlobal && selectedGlobalHomeId && activeTab === 'dashboard' && (
          <GlobalAdminResidentList
            home={selectedHome || {
              id: 'home-benoni-01',
              name: 'Default Home',
              location: '',
              cutoffTime: '09:15',
              careStaffOnDuty: 0,
              primaryNurse: '',
              providerPartner: '',
            }}
            residents={residents}
            onBack={() => setSelectedGlobalHomeId(null)}
            onOpenStaffManagement={() => setIsStaffMgmtOpen(true)}
            onDeleteResident={async (id) => {
              const ok = await api.deleteResident(id);
              if (ok) await loadDbStatus();
              return ok;
            }}
          />
        )}

        {!showLogin && activeTab === 'dashboard' && !isGlobal && (
          <StaffDashboard
            home={selectedHome || {
              id: 'home-benoni-01',
              name: 'Default Home',
              location: '',
              cutoffTime: '09:15',
              careStaffOnDuty: 0,
              primaryNurse: '',
              providerPartner: '',
            }}
            allHomes={effectiveHomes}
            residents={visibleResidents}
            currentTimeStr={currentTimeStr}
            onUpdateResidentStatus={handleCheckIn}
            onAddResident={async (payload) => {
              await api.addResident(payload);
              await loadDbStatus();
            }}
            onUpdateResident={async () => {}}
            onOpenCutoffModal={() => setIsCutoffModalOpen(true)}
            onOpenSeniorWebsite={(residentId) => {
              if (residentId) setActiveResidentId(residentId);
              setActiveTab('senior-checkin');
            }}
            onOpenGuideModal={() => setIsGuideModalOpen(true)}
            staff={staff}
            onOpenStaffManagement={undefined}
          />
        )}

        {!showLogin && activeTab === 'senior-checkin' && viewMode !== 'resident' && (
          <SeniorCheckInWebsite
            initialResident={residents.find((r) => r.id === activeResidentId)}
            allResidents={residents}
            onCheckInStatus={handleCheckIn}
          />
        )}
      </main>

      {/* Modals */}
      {isCutoffModalOpen && (
        <CutoffModal
          isOpen={isCutoffModalOpen}
          onClose={() => setIsCutoffModalOpen(false)}
          homes={homes}
          selectedHome={selectedHome}
          onSaveCutoff={async (homeId, cutoff) => {
            await api.updateCutoff(homeId, cutoff);
            await loadDbStatus();
            setIsCutoffModalOpen(false);
          }}
        />
      )}
      {isGuideModalOpen && (
        <WorkflowGuideModal
          isOpen={isGuideModalOpen}
          onClose={() => setIsGuideModalOpen(false)}
        />
      )}
      {isStaffMgmtOpen && (
        <StaffManagement
          isOpen={isStaffMgmtOpen}
          onClose={() => setIsStaffMgmtOpen(false)}
          staff={staff}
          onRefresh={loadDbStatus}
        />
      )}
      {isHomeMgmtOpen && (
        <HomeManagement
          isOpen={isHomeMgmtOpen}
          onClose={() => setIsHomeMgmtOpen(false)}
          staff={staff}
          onRefresh={loadDbStatus}
        />
      )}
      {isDbVerifyOpen && (
        <DbVerificationModal
          isOpen={isDbVerifyOpen}
          onClose={() => setIsDbVerifyOpen(false)}
        />
      )}
    </div>
  );
}
