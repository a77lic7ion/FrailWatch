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
import { INITIAL_HOMES, INITIAL_RESIDENTS } from './data/mockData';
import { ActiveTab, CareHome, Resident, CheckInStatus } from './types';
import { api, DatabaseStatus } from './services/api';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [homes, setHomes] = useState<CareHome[]>(INITIAL_HOMES);
  const [selectedHomeId, setSelectedHomeId] = useState<string>(INITIAL_HOMES[0].id);
  const [residents, setResidents] = useState<Resident[]>(INITIAL_RESIDENTS);
  const [activeResidentId, setActiveResidentId] = useState<string>(INITIAL_RESIDENTS[0]?.id || '');
  const [currentTimeStr, setCurrentTimeStr] = useState<string>('08:35 AM');
  const [isSimModalOpen, setIsSimModalOpen] = useState<boolean>(false);
  const [isCutoffModalOpen, setIsCutoffModalOpen] = useState<boolean>(false);
  const [isDbModalOpen, setIsDbModalOpen] = useState<boolean>(false);
  const [dbStatus, setDbStatus] = useState<DatabaseStatus | null>(null);
  const [isDbRefreshing, setIsDbRefreshing] = useState<boolean>(false);

  // Check URL parameters for direct verification / senior check-in link
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      if (params.get('verify') || params.get('token') || params.get('residentId') || params.get('mode') === 'checkin') {
        setActiveTab('senior-checkin');
      }
    } catch {
      // Ignore URL parsing errors
    }
  }, []);

  // Load database status and sync initial data
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
  }, [loadDbStatus]);

  // Selected home object
  const selectedHome = homes.find((h) => h.id === selectedHomeId) || homes[0];

  // Live urgent counters
  const urgentCount = residents.filter((r) => r.status === 'not_ok').length;
  const overdueCount = residents.filter((r) => r.status === 'overdue').length;

  // Handle resident check-in from phone interface or staff
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
              { date: '2026-08-30', day: 'Sun', status: 'ok', time: '08:05 AM' },
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

        return {
          ...r,
          status,
          checkInTime: status === 'awaiting' ? undefined : timeFormatted,
          sevenDayHistory: currentHistory,
        };
      })
    );

    // Sync to Firestore backend
    api.recordCheckIn(residentId, status, timeFormatted);
  };

  // Add resident handler (administrator adds user with cell number and name per home)
  const handleAddResident = async (newResData: Partial<Resident>) => {
    const id = `res-${Date.now()}`;
    const token = 'ew_' + Math.random().toString(36).substring(2, 9) + '_' + Date.now().toString(36);
    const newResident: Resident = {
      id,
      homeId: newResData.homeId || selectedHomeId,
      name: newResData.name || 'New Resident',
      room: newResData.room || 'Room TBD',
      wing: newResData.wing || 'Willow Cottage',
      phone: newResData.phone || '+27 82 000 0000',
      deviceLinked: false,
      verificationToken: token,
      status: 'awaiting',
      caregiver: newResData.caregiver || 'Sr. Sarah Botha',
      medicalAlerts: newResData.medicalAlerts || [],
      notes: newResData.notes || '',
      emergencyContact: newResData.emergencyContact || {
        name: 'Emergency Contact',
        relationship: 'Family',
        phone: '+27 82 111 2222',
        notifyOnIssue: true,
      },
      sevenDayHistory: [
        { date: '2026-09-03', day: 'Today', status: 'awaiting' }
      ]
    };

    setResidents((prev) => [newResident, ...prev]);
    const apiResult = await api.addResident(newResident);
    return apiResult;
  };

  // Update resident details
  const handleUpdateResident = (updated: Resident) => {
    setResidents((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
    api.updateResident(updated.id, updated);
  };

  // Simulation: fast forward past 09:15 cutoff
  const handleFastForwardCutoff = () => {
    setCurrentTimeStr('09:20 AM');
    setResidents((prev) =>
      prev.map((r) => {
        if (r.status === 'awaiting') {
          return {
            ...r,
            status: 'overdue' as CheckInStatus,
            notes: 'Cutoff passed without response. Priority physical window check needed.',
          };
        }
        return r;
      })
    );
  };

  // Simulation: all OK
  const handleSimulateAllOk = () => {
    setResidents((prev) =>
      prev.map((r) => ({
        ...r,
        status: 'ok' as CheckInStatus,
        checkInTime: r.checkInTime || '08:10 AM',
      }))
    );
  };

  // Reset to default initial state
  const handleResetMorning = () => {
    setCurrentTimeStr('08:35 AM');
    setResidents(INITIAL_RESIDENTS);
    setActiveResidentId(INITIAL_RESIDENTS[0]?.id || '');
    api.resetDemo();
  };

  // Save updated cutoff time
  const handleSaveCutoff = (newCutoff: string) => {
    setHomes((prev) =>
      prev.map((h) => (h.id === selectedHomeId ? { ...h, cutoffTime: newCutoff } : h))
    );
    api.updateCutoff(selectedHomeId, newCutoff);
  };

  // Switch to phone simulator focusing on a specific resident
  const handleSelectResidentForPhone = (id: string) => {
    setActiveResidentId(id);
    setActiveTab('resident-phone');
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col selection:bg-emerald-500 selection:text-white">
      {/* Top Main Navigation Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        selectedHome={selectedHome}
        allHomes={homes}
        setSelectedHomeId={setSelectedHomeId}
        currentTimeStr={currentTimeStr}
        urgentCount={urgentCount}
        overdueCount={overdueCount}
        onOpenSimModal={() => setIsSimModalOpen(true)}
        onResetData={handleResetMorning}
        onOpenDbModal={() => setIsDbModalOpen(true)}
        isDbConnected={dbStatus?.firebaseConnected}
      />

      {/* Main View Area */}
      <main className="flex-1 pb-16">
        {activeTab === 'dashboard' && (
          <StaffDashboard
            home={selectedHome}
            allHomes={homes}
            residents={residents}
            currentTimeStr={currentTimeStr}
            onUpdateResidentStatus={(id, status) => handleCheckIn(id, status)}
            onAddResident={handleAddResident}
            onUpdateResident={handleUpdateResident}
            onSelectResidentForPhone={handleSelectResidentForPhone}
            onOpenCutoffModal={() => setIsCutoffModalOpen(true)}
            onOpenSeniorWebsite={(residentId) => {
              if (residentId) setActiveResidentId(residentId);
              setActiveTab('senior-checkin');
            }}
          />
        )}

        {activeTab === 'senior-checkin' && (
          <SeniorCheckInWebsite
            initialResident={residents.find((r) => r.id === activeResidentId) || residents[0]}
            initialHome={selectedHome}
            onCheckInStatus={handleCheckIn}
            onReturnToAdmin={() => setActiveTab('dashboard')}
          />
        )}

        {activeTab === 'resident-phone' && (
          <ResidentPhoneView
            residents={residents}
            activeResidentId={activeResidentId}
            setActiveResidentId={setActiveResidentId}
            onCheckIn={handleCheckIn}
            cutoffTime={selectedHome.cutoffTime}
          />
        )}

        {activeTab === 'family-provider' && (
          <FamilyAndProviderView
            residents={residents}
            selectedHome={selectedHome}
          />
        )}

        {activeTab === 'comparison' && (
          <ComparisonCritique />
        )}
      </main>

      {/* Interactive Simulation Modal */}
      <SimulationModal
        isOpen={isSimModalOpen}
        onClose={() => setIsSimModalOpen(false)}
        residents={residents}
        onTriggerStatus={handleCheckIn}
        onFastForwardCutoff={handleFastForwardCutoff}
        onSimulateAllOk={handleSimulateAllOk}
        onResetMorning={handleResetMorning}
      />

      {/* Morning Cutoff Adjuster Modal */}
      <CutoffModal
        isOpen={isCutoffModalOpen}
        onClose={() => setIsCutoffModalOpen(false)}
        home={selectedHome}
        onSaveCutoff={handleSaveCutoff}
      />

      {/* Firebase Database Status Modal */}
      <DatabaseModal
        isOpen={isDbModalOpen}
        onClose={() => setIsDbModalOpen(false)}
        dbStatus={dbStatus}
        onRefresh={loadDbStatus}
        isRefreshing={isDbRefreshing}
      />

      {/* Bottom Subtle Status Footer */}
      <footer className="border-t border-slate-200 bg-white py-4 px-4 sm:px-8 text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
          <span className="font-bold text-slate-800">ElderWatch Active</span>
          <span>· Daily morning reassurance protocol</span>
        </div>
        <div className="flex items-center gap-4 text-slate-500">
          <span>Facility: <strong className="text-slate-700">{selectedHome.name}</strong></span>
          <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200 font-semibold text-[11px]">
            <span>Powered by</span>
            <span className="font-extrabold tracking-wide text-slate-900">4TIFY SECURITY</span>
          </span>
        </div>
      </footer>
    </div>
  );
}
