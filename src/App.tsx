import React, { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header';
import { StaffDashboard } from './components/StaffDashboard';
import { ResidentPhoneView } from './components/ResidentPhoneView';
import { FamilyAndProviderView } from './components/FamilyAndProviderView';
import { ComparisonCritique } from './components/ComparisonCritique';
import { SimulationModal } from './components/SimulationModal';
import { CutoffModal } from './components/CutoffModal';
import { DatabaseModal } from './components/DatabaseModal';
import { SeniorCheckInWebsite } from './components/SeniorCheckInWebsite';
import { WorkflowGuideModal } from './components/WorkflowGuideModal';
import { ResidentPhoneLogin } from './components/ResidentPhoneLogin';
import { StaffLogin } from './components/StaffLogin';
import { StaffManagement } from './components/StaffManagement';
import { INITIAL_HOMES, INITIAL_RESIDENTS } from './data/mockData';
import { ActiveTab, CareHome, Resident, CheckInStatus } from './types';
import { api, DatabaseStatus } from './services/api';
import { onStaffAuthChange, staffLogin, staffLogout } from './services/staffAuth';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [staff, setStaff] = useState<any>(null);
  const [staffLoading, setStaffLoading] = useState<boolean>(true);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [residentLoginTarget, setResidentLoginTarget] = useState<Resident | null>(null);
  const [homes, setHomes] = useState<CareHome[]>(INITIAL_HOMES);
  const [selectedHomeId, setSelectedHomeId] = useState<string>(INITIAL_HOMES[0].id);
  const [residents, setResidents] = useState<Resident[]>(INITIAL_RESIDENTS);
  const [activeResidentId, setActiveResidentId] = useState<string>(INITIAL_RESIDENTS[0]?.id || '');
  const [currentTimeStr, setCurrentTimeStr] = useState<string>('08:35 AM');
  const [isSimModalOpen, setIsSimModalOpen] = useState<boolean>(false);
  const [isCutoffModalOpen, setIsCutoffModalOpen] = useState<boolean>(false);
  const [isDbModalOpen, setIsDbModalOpen] = useState<boolean>(false);
  const [isGuideModalOpen, setIsGuideModalOpen] = useState<boolean>(false);
  const [isStaffMgmtOpen, setIsStaffMgmtOpen] = useState<boolean>(false);
  const [dbStatus, setDbStatus] = useState<DatabaseStatus | null>(null);
  const [isDbRefreshing, setIsDbRefreshing] = useState<boolean>(false);

  const logout = async () => {
    try { await staffLogout(); } catch {}
    setStaff(null);
    setActiveTab('dashboard');
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
    if (!isGlobal && effectiveSelectedHomeId) {
      setSelectedHomeId(effectiveSelectedHomeId);
    }
  }, [isGlobal, effectiveSelectedHomeId]);

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
      if (appData && appData.residents && appData.residents.length > 0) {
        const sanitizedResidents: Resident[] = appData.residents.map((r: any) => ({
          ...r,
          wing: r.wing || 'Willow Cottage',
          sevenDayHistory: Array.isArray(r.sevenDayHistory) && r.sevenDayHistory.length > 0
            ? r.sevenDayHistory
            : [
                { date: '2026-08-28', day: 'Fri', status: 'ok', time: '08:10 AM' },
                { date: '2026-08-29', day: 'Sat', status: 'ok', time: '08:15 AM' },
                { date: '2026-08-30', day: 'Sun', status: 'ok', time: '08:12 AM' },
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
  }, [loadDbStatus]);

  const selectedHome = (effectiveHomes.find((h) => h.id === effectiveSelectedHomeId) || effectiveHomes[0] || (homes[0] || { id: 'home-benoni-01', name: 'Default Home', location: '', cutoffTime: '09:15', careStaffOnDuty: 0, primaryNurse: '', providerPartner: '' }));
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
      />

      <main className="flex-1">
        {showLogin && (
          <StaffLogin
            loading={staffLoading}
            error={loginError}
            onLogin={async (email, password) => {
              setLoginError(null);
              try {
                const result = await staffLogin(email, password);
                setStaff(result.staff);
              } catch (err: any) {
                setLoginError(err.message || 'Login failed');
              }
            }}
          />
        )}

        {!showLogin && activeTab === 'dashboard' && (
          <StaffDashboard
            home={selectedHome}
            allHomes={effectiveHomes}
            residents={visibleResidents}
            currentTimeStr={currentTimeStr}
            onUpdateResidentStatus={handleCheckIn}
            onAddResident={async (payload) => {
              await api.addResident(payload);
              await loadDbStatus();
            }}
            onUpdateResident={async () => {}}
            onSelectResidentForPhone={(id) => {
              setActiveResidentId(id);
              setActiveTab('resident-login');
            }}
            onOpenCutoffModal={() => setIsCutoffModalOpen(true)}
            onOpenSeniorWebsite={(residentId) => {
              if (residentId) setActiveResidentId(residentId);
              setActiveTab('senior-checkin');
            }}
            onOpenGuideModal={() => setIsGuideModalOpen(true)}
            staff={staff}
            onOpenStaffManagement={isGlobal ? () => setIsStaffMgmtOpen(true) : undefined}
          />
        )}

        {!showLogin && activeTab === 'senior-checkin' && (
          <SeniorCheckInWebsite
            initialResident={residents.find((r) => r.id === activeResidentId)}
            allResidents={residents}
            onCheckInStatus={handleCheckIn}
            onReturnToAdmin={() => setActiveTab('dashboard')}
          />
        )}

        {!showLogin && activeTab === 'resident-login' && (
          <ResidentPhoneLogin
            residents={residents}
            onLoginSuccess={(resident) => {
              setActiveResidentId(resident.id);
              setActiveTab('senior-checkin');
            }}
          />
        )}

        {!showLogin && activeTab === 'family-view' && <FamilyAndProviderView />}
        {!showLogin && activeTab === 'comparison' && <ComparisonCritique />}

        {!showLogin && activeTab === 'database' && (
          <DatabaseModal
            isOpen={isDbModalOpen}
            onClose={() => setIsDbModalOpen(false)}
            dbStatus={dbStatus}
            onRefresh={loadDbStatus}
            isRefreshing={isDbRefreshing}
          />
        )}
      </main>

      {/* Modals */}
      {isSimModalOpen && (
        <SimulationModal
          onClose={() => setIsSimModalOpen(false)}
          residents={residents}
          onSimulate={(updated) => setResidents(updated)}
        />
      )}
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
    </div>
  );
}
