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
import { HomeWeeklyOverview } from './components/HomeWeeklyOverview';
import { CutoffModal } from './components/CutoffModal';
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
  const [dbStatus, setDbStatus] = useState<DatabaseStatus | null>(null);
  const [isDbRefreshing, setIsDbRefreshing] = useState<boolean>(false);

  const logout = async () => {
    try { markLoggingOut(); await staffLogout(); } catch {}
    setStaff(null);
    setActiveTab('dashboard');
    setSelectedGlobalHomeId(null);
    setResidents([]);
    setHomes(INITIAL_HOMES);
    setStaffLoading(true);
  };

  useEffect(() => {
    return onStaffAuthChange((s) => {
      setStaff(s);
      setStaffLoading(false);
    });
  }, []);

  const isGlobal = staff?.role === 'superadmin' || staff?.homeId === '*';
  const effectiveHomes = isGlobal ? homes : homes.filter((h) => h.id === staff?.homeId);
  const effectiveSelectedHomeId = isGlobal ? selectedHomeId : (effectiveHomes[0]?.id || selectedHomeId);

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
    const params = new URLSearchParams(window.location.search);
    if (params.get('verify') || params.get('token') || params.get('residentId') || params.get('mode') === 'checkin') {
      setActiveTab('senior-checkin');
    }
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
      <Header
        activeTab={activeTab}
        onTabChange={setActiveTab}
        dbStatus={dbStatus}
        staff={staff}
        onLogout={logout}
        onOpenStaffManagement={isGlobal ? () => setIsStaffMgmtOpen(true) : undefined}
        onOpenHomeManagement={isGlobal ? () => setIsHomeMgmtOpen(true) : undefined}
        onOpenDbVerify={isGlobal ? () => setIsDbVerifyOpen(true) : undefined}
      />

      <main className="flex-1">
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

        {!showLogin && activeTab === 'senior-checkin' && (
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
