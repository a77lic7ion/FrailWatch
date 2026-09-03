import React, { useState } from 'react';
import { 
  AlertCircle, 
  CheckCircle2, 
  Clock, 
  Phone, 
  Search, 
  Plus, 
  ShieldAlert, 
  FileDown, 
  Filter, 
  ChevronRight, 
  UserCheck, 
  Building2, 
  X, 
  QrCode, 
  BellRing,
  HeartPulse,
  Send,
  Check,
  RotateCw,
  Copy,
  ExternalLink,
  Link2,
  Smartphone,
  BookOpen,
  UserCog
} from 'lucide-react';
import { Resident, CareHome, CheckInStatus } from '../types';
import { api } from '../services/api';

interface StaffDashboardProps {
  home?: CareHome;
  allHomes?: CareHome[];
  residents: Resident[];
  currentTimeStr: string;
  onUpdateResidentStatus: (residentId: string, status: CheckInStatus) => void;
  onAddResident: (resident: Partial<Resident>) => Promise<any> | void;
  onUpdateResident: (resident: Resident) => void;
  onSelectResidentForPhone: (id: string) => void;
  onOpenCutoffModal: () => void;
  onOpenSeniorWebsite?: (residentId?: string) => void;
  onOpenGuideModal?: () => void;
  staff?: any;
  onOpenStaffManagement?: () => void;
}

export const StaffDashboard: React.FC<StaffDashboardProps> = ({
  home,
  allHomes,
  residents,
  currentTimeStr,
  onUpdateResidentStatus,
  onAddResident,
  onUpdateResident,
  onSelectResidentForPhone,
  onOpenCutoffModal,
  onOpenSeniorWebsite,
  onOpenGuideModal,
  staff,
  onOpenStaffManagement,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'action' | 'ok' | 'awaiting'>('all');
  const [wingFilter, setWingFilter] = useState<string>('all');
  const [selectedResident, setSelectedResident] = useState<Resident | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showCreateHomeModal, setShowCreateHomeModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [editingHome, setEditingHome] = useState<CareHome | null>(null);
  const [editingResident, setEditingResident] = useState<Resident | null>(null);

  // New resident form state (admin sets name and phone per home)
  const [newName, setNewName] = useState('');
  const [newRoom, setNewRoom] = useState('');
  const [newWing, setNewWing] = useState('Willow Cottage');
  const [newPhone, setNewPhone] = useState('');
  const [newCaregiver, setNewCaregiver] = useState('Sr. Sarah Botha');
  const [newContactName, setNewContactName] = useState('');
  const [newContactPhone, setNewContactPhone] = useState('');
  const [newContactRel, setNewContactRel] = useState('Child');
  const homeOrDefault = home || {
    id: 'home-benoni-01',
    name: 'Default Home',
    location: '',
    cutoffTime: '09:15',
    careStaffOnDuty: 0,
    primaryNurse: '',
    providerPartner: '',
  } as CareHome;
  const [selectedHomeForResident, setSelectedHomeForResident] = useState<string>(homeOrDefault.id);

  // Verification modal state after admin creates user
  const [createdVerificationData, setCreatedVerificationData] = useState<{
    residentName: string;
    phone: string;
    room: string;
    homeName: string;
    verificationToken: string;
    verificationUrl: string;
    residentId: string;
  } | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedSms, setCopiedSms] = useState(false);

  // Create home form state
  const [newHomeId, setNewHomeId] = useState('');
  const [newHomeName, setNewHomeName] = useState('');
  const [newHomeLocation, setNewHomeLocation] = useState('');
  const [newHomeCutoff, setNewHomeCutoff] = useState('09:00');
  const [creatingHome, setCreatingHome] = useState(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const createHome = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreatingHome(true);
    try {
      const data = await api.createHome({ id: newHomeId, name: newHomeName, location: newHomeLocation, cutoffTime: newHomeCutoff });
      showToast(`Home created: ${data.home.name}`);
      setNewHomeId('');
      setNewHomeName('');
      setNewHomeLocation('');
      setNewHomeCutoff('09:00');
      setShowCreateHomeModal(false);
      onAddResident({}).catch(() => {});
    } catch (e: any) {
      showToast(e.message || 'Failed to create home');
    } finally {
      setCreatingHome(false);
    }
  };

  const saveEditingHome = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingHome) return;
    const updated = await api.updateHome(editingHome.id, { name: editingHome.name, location: editingHome.location, cutoffTime: editingHome.cutoffTime, primaryNurse: editingHome.primaryNurse, providerPartner: editingHome.providerPartner });
    if (updated) showToast('Home updated');
    setEditingHome(null);
    onAddResident({}).catch(() => {});
  };

  const removeHome = async (id: string) => {
    const ok = window.confirm('Delete this home? This cannot be undone.');
    if (!ok) return;
    const removed = await api.deleteHome(id);
    if (removed) {
      showToast('Home deleted');
      onAddResident({}).catch(() => {});
    }
  };

  const saveEditingResident = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingResident) return;
    const updates = {
      name: editingResident.name,
      room: editingResident.room,
      wing: editingResident.wing,
      phone: editingResident.phone,
      caregiver: editingResident.caregiver,
    };
    const updated = await api.updateResident(editingResident.id, updates);
    if (updated) {
      showToast('Resident updated');
      setEditingResident(null);
      onAddResident({}).catch(() => {});
    }
  };

  const removeResident = async (id: string) => {
    const ok = window.confirm('Remove this resident record?');
    if (!ok) return;
    const removed = await api.deleteResident(id);
    if (removed) {
      showToast('Resident removed');
      onAddResident({}).catch(() => {});
    }
  };

  // Metrics calculation
  const totalCount = residents.length;
  const okCount = residents.filter((r) => r.status === 'ok').length;
  const notOkCount = residents.filter((r) => r.status === 'not_ok').length;
  const overdueCount = residents.filter((r) => r.status === 'overdue').length;
  const awaitingCount = residents.filter((r) => r.status === 'awaiting').length;
  const actionCount = notOkCount + overdueCount;

  // Urgent residents needing immediate physical check or medical intervention
  const urgentResidents = residents.filter((r) => r.status === 'not_ok' || r.status === 'overdue');

  // Filtered residents list
  const filteredResidents = residents.filter((r) => {
    const matchesSearch = 
      r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.room.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.phone.includes(searchQuery);
    
    const matchesWing = wingFilter === 'all' || r.wing === wingFilter;

    let matchesStatus = true;
    if (statusFilter === 'action') {
      matchesStatus = r.status === 'not_ok' || r.status === 'overdue';
    } else if (statusFilter === 'ok') {
      matchesStatus = r.status === 'ok';
    } else if (statusFilter === 'awaiting') {
      matchesStatus = r.status === 'awaiting';
    }

    return matchesSearch && matchesWing && matchesStatus;
  });

  const wings = Array.from(new Set(residents.map((r) => r.wing || 'Willow Cottage').filter(Boolean)));

  const handleCreateResident = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newRoom.trim() || !newPhone.trim()) {
      alert('Please provide resident name, room number, and mobile cell phone number.');
      return;
    }

    const targetHome = (allHomes || [homeOrDefault]).find((h) => h.id === selectedHomeForResident) || homeOrDefault;
    const token = 'ew_' + Math.random().toString(36).substring(2, 9) + '_' + Date.now().toString(36);

    const newRes: Partial<Resident> = {
      name: newName.trim(),
      room: newRoom.trim(),
      homeId: targetHome.id,
      wing: newWing,
      phone: newPhone.trim(),
      deviceLinked: false,
      verificationToken: token,
      status: 'awaiting',
      caregiver: newCaregiver,
      medicalAlerts: [],
      notes: 'New resident setup. Send verification link to attach phone.',
      emergencyContact: {
        name: newContactName || 'Family Member',
        phone: newContactPhone || newPhone,
        relationship: newContactRel,
        notifyOnIssue: true,
      },
      sevenDayHistory: [
        { date: '2026-09-03', day: 'Today', status: 'awaiting' }
      ]
    };

    const res: any = await onAddResident(newRes);
    const resolvedToken = res?.verificationToken || token;
    const resolvedUrl = `${window.location.origin}/?verify=${resolvedToken}&home=${targetHome.id}`;

    setShowAddModal(false);
    setCreatedVerificationData({
      residentName: newName.trim(),
      phone: newPhone.trim(),
      room: newRoom.trim(),
      homeName: targetHome.name,
      verificationToken: resolvedToken,
      verificationUrl: resolvedUrl,
      residentId: res?.resident?.id || '',
    });

    setNewName('');
    setNewRoom('');
    setNewPhone('');
    setNewContactName('');
    setNewContactPhone('');
    showToast(`Resident ${newName} saved to database for ${targetHome.name}`);
  };

  const handleShareExistingResidentLink = (r: Resident) => {
    const targetHome = (allHomes || [homeOrDefault]).find((h) => h.id === (r.homeId || homeOrDefault.id)) || homeOrDefault;
    const token = r.verificationToken || `ew_${r.id}`;
    const url = `${window.location.origin}/?verify=${token}&home=${targetHome.id}`;
    setCreatedVerificationData({
      residentName: r.name,
      phone: r.phone,
      room: r.room,
      homeName: targetHome.name,
      verificationToken: token,
      verificationUrl: url,
      residentId: r.id,
    });
  };

  const handleDispatchCarer = (r: Resident) => {
    showToast(`Dispatch alert sent to ${r.caregiver} for ${r.room} (${r.name})`);
  };

  const handleResolveUrgent = (r: Resident) => {
    onUpdateResidentStatus(r.id, 'ok');
    showToast(`In-person check recorded for ${r.name}. Status marked OK.`);
    if (selectedResident?.id === r.id) {
      setSelectedResident({ ...selectedResident, status: 'ok', checkInTime: 'In-person check: ' + currentTimeStr });
    }
  };

  return (
    <div className="py-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-6">
      
      {/* Toast notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-2xl border border-slate-700 flex items-center gap-3 animate-in slide-in-from-bottom-5">
          <BellRing className="w-5 h-5 text-emerald-400" />
          <span className="text-xs font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* Top Banner: Facility Context & Cutoff Review */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 mb-1">
              <Building2 className="w-4 h-4 text-emerald-600" />
              <span>{homeOrDefault.name} · {homeOrDefault.location}</span>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold text-[11px]">
                {homeOrDefault.providerPartner}
              </span>
              {staff?.role === 'superadmin' && (
                <>
                  <button onClick={() => setEditingHome(homeOrDefault)} className="text-[11px] font-bold text-indigo-700 hover:text-indigo-900 underline">Edit</button>
                  <button onClick={() => removeHome(homeOrDefault.id)} className="text-[11px] font-bold text-rose-700 hover:text-rose-900 underline">Delete</button>
                </>
              )}
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              Morning Care Triage Dashboard
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl">
              Replaces manual door-to-door morning walking rounds with a 2-minute live overview. 
              Residents respond with giant green/red buttons; missed cutoffs trigger automatic door-checks.
            </p>
          </div>

          {/* Cutoff time status pill */}
          <div className="flex flex-wrap items-center gap-3 bg-slate-50 p-3 sm:p-4 rounded-2xl border border-slate-200">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-600 font-bold">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  Morning Cutoff
                </div>
                <div className="text-lg font-black text-slate-900 font-mono">
                  {homeOrDefault.cutoffTime} AM
                </div>
              </div>
            </div>

            <div className="h-8 w-px bg-slate-200 hidden sm:block"></div>

            <div className="flex flex-wrap items-center gap-2">
              {onOpenGuideModal && (
                <button
                  id="open-guide-btn"
                  onClick={onOpenGuideModal}
                  className="px-3 py-2 rounded-xl text-xs font-bold bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 transition flex items-center gap-1.5 shadow-xs"
                  title="View complete Workflow and Link guide"
                >
                  <BookOpen className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Workflow & Link Guide</span>
                </button>
              )}
              <button
                id="edit-cutoff-btn"
                onClick={onOpenCutoffModal}
                className="px-3 py-2 rounded-xl text-xs font-bold bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 shadow-xs transition"
              >
                Change Cutoff
              </button>
              <button
                id="export-report-btn"
                onClick={() => setShowExportModal(true)}
                className="px-3.5 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white transition flex items-center gap-1.5 shadow-sm"
              >
                <FileDown className="w-3.5 h-3.5" />
                <span>Report</span>
              </button>
              {onOpenStaffManagement && (
                <button
                  onClick={onOpenStaffManagement}
                  className="px-3 py-2 rounded-xl text-xs font-bold bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 shadow-xs transition flex items-center gap-1.5"
                >
                  <UserCog className="w-3.5 h-3.5" />
                  <span>Staff</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Triage Metrics Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
        
        {/* Total */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">TOTAL RESIDENTS</div>
          <div className="text-3xl sm:text-4xl font-black text-slate-900">{totalCount}</div>
          <div className="text-[11px] text-slate-400 mt-1">100% active monitoring</div>
        </div>

        {/* Checked In OK */}
        <div 
          onClick={() => setStatusFilter('ok')}
          className="bg-emerald-50 hover:bg-emerald-100/70 rounded-2xl p-5 border border-emerald-100 shadow-sm cursor-pointer transition"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-emerald-700 uppercase tracking-wider">I&apos;M OKAY</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-3xl sm:text-4xl font-black text-emerald-700">{okCount}</div>
          <div className="text-[11px] text-emerald-600/80 font-medium mt-1">
            {totalCount > 0 ? Math.round((okCount / totalCount) * 100) : 0}% of community
          </div>
        </div>

        {/* Flagged for Help */}
        <div 
          onClick={() => setStatusFilter('action')}
          className={`rounded-2xl p-5 border shadow-sm cursor-pointer transition ${
            notOkCount > 0 
              ? 'bg-rose-50 border-rose-200 ring-2 ring-rose-500/20 animate-pulse' 
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-rose-700 uppercase tracking-wider">NEED HELP</span>
            <AlertCircle className={`w-4 h-4 text-rose-600 ${notOkCount > 0 ? 'animate-bounce' : ''}`} />
          </div>
          <div className="text-3xl sm:text-4xl font-black text-rose-700">{notOkCount}</div>
          <div className="text-[11px] text-rose-600/80 font-bold mt-1">
            {notOkCount > 0 ? 'Immediate care call' : 'Zero calls'}
          </div>
        </div>

        {/* Overdue / No Response */}
        <div 
          onClick={() => setStatusFilter('action')}
          className={`rounded-2xl p-5 border shadow-sm cursor-pointer transition ${
            overdueCount > 0 
              ? 'bg-amber-50 border-amber-200 ring-2 ring-amber-500/20' 
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-amber-700 uppercase tracking-wider">NO RESPONSE</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-3xl sm:text-4xl font-black text-amber-700">{overdueCount}</div>
          <div className="text-[11px] text-amber-600/80 font-medium mt-1">
            {overdueCount > 0 ? 'Door check needed' : 'Zero overdue'}
          </div>
        </div>

        {/* Awaiting Check-in */}
        <div 
          onClick={() => setStatusFilter('awaiting')}
          className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm cursor-pointer hover:bg-slate-50 transition col-span-2 md:col-span-1"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">AWAITING</span>
            <Clock className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-3xl sm:text-4xl font-black text-slate-700">{awaitingCount}</div>
          <div className="text-[11px] text-slate-400 mt-1">Window still active</div>
        </div>

      </div>

      {/* URGENT ACTION QUEUE: High-Priority Triage Banner */}
      {urgentResidents.length > 0 && (
        <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-md border border-rose-500/40">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping"></span>
              <h2 className="text-lg sm:text-xl font-bold tracking-tight flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-rose-400" />
                Immediate Care Action Required ({urgentResidents.length})
              </h2>
            </div>
            <span className="text-xs bg-rose-500/20 text-rose-300 px-3 py-1 rounded-full font-bold uppercase tracking-wider border border-rose-400/30">
              High Priority Triage
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {urgentResidents.map((r) => {
              const isHelp = r.status === 'not_ok';
              return (
                <div 
                  key={r.id}
                  className="bg-slate-950/80 rounded-xl p-4 border border-rose-500/40 flex flex-col justify-between gap-3 shadow-inner"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-bold text-white">{r.name}</span>
                        <span className="px-2 py-0.5 rounded text-xs font-black bg-rose-600 text-white">
                          {r.room}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {r.wing} · Assigned: {r.caregiver}
                      </p>
                    </div>

                    <span className={`px-2.5 py-1 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-1 ${
                      isHelp 
                        ? 'bg-rose-600 text-white animate-pulse' 
                        : 'bg-amber-500 text-slate-950 font-bold'
                    }`}>
                      {isHelp ? '🚨 NEED HELP' : '⚠️ CUTOFF MISSED'}
                    </span>
                  </div>

                  {/* Medical Note or Explanation */}
                  <div className="text-xs bg-slate-900 p-3 rounded-lg border border-slate-800 text-slate-300">
                    <span className="text-rose-400 font-bold">Alert: </span>
                    {r.notes || (isHelp ? 'Resident tapped red button.' : 'No response logged by cutoff time.')}
                    {r.medicalAlerts && r.medicalAlerts.length > 0 && (
                      <div className="mt-1.5 flex flex-wrap gap-1">
                        {r.medicalAlerts.map((m, idx) => (
                          <span key={idx} className="text-[10px] bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded font-medium">
                            {m}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Immediate Action Buttons */}
                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    <button
                      onClick={() => handleDispatchCarer(r)}
                      className="flex-1 py-2 px-3 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-md shadow-rose-600/20"
                    >
                      <HeartPulse className="w-3.5 h-3.5" />
                      <span>Dispatch Nurse</span>
                    </button>

                    <a
                      href={`tel:${r.phone}`}
                      className="py-2 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition flex items-center gap-1.5"
                    >
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                      <span>Call Room</span>
                    </a>

                    <button
                      onClick={() => handleResolveUrgent(r)}
                      className="py-2 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition flex items-center gap-1.5"
                      title="Mark resident checked in person"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Mark Safe</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Search, Filter & Actions Toolbar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm flex flex-col lg:flex-row items-center justify-between gap-4">
        
        {/* Search Input */}
        <div className="relative w-full lg:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            id="resident-search-input"
            type="text"
            placeholder="Search by name, room (e.g. 14)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900 placeholder:text-slate-400"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5 w-full lg:w-auto">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
              statusFilter === 'all' 
                ? 'bg-slate-900 text-white' 
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All ({totalCount})
          </button>

          <button
            onClick={() => setStatusFilter('action')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition flex items-center gap-1 ${
              statusFilter === 'action' 
                ? 'bg-rose-600 text-white' 
                : 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200'
            }`}
          >
            <AlertCircle className="w-3 h-3" />
            <span>Urgent / Overdue ({actionCount})</span>
          </button>

          <button
            onClick={() => setStatusFilter('ok')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition flex items-center gap-1 ${
              statusFilter === 'ok' 
                ? 'bg-emerald-600 text-white' 
                : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
            }`}
          >
            <CheckCircle2 className="w-3 h-3" />
            <span>Checked In ({okCount})</span>
          </button>

          <button
            onClick={() => setStatusFilter('awaiting')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
              statusFilter === 'awaiting' 
                ? 'bg-slate-700 text-white' 
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Awaiting ({awaitingCount})
          </button>

          {/* Wing Selector */}
          <div className="flex items-center gap-1 ml-auto lg:ml-2">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              id="wing-filter-select"
              aria-label="Filter by Wing"
              value={wingFilter}
              onChange={(e) => setWingFilter(e.target.value)}
              className="text-xs bg-slate-100 border border-slate-200 rounded-xl px-2.5 py-1.5 text-slate-700 font-semibold focus:outline-none cursor-pointer"
            >
              <option key="all" value="all">All Wings ({wings.length})</option>
              {wings.map((w) => (
                <option key={`wing-${w}`} value={w}>{w}</option>
              ))}
            </select>
          </div>

          {/* Add Resident Button */}
          <button
            id="add-resident-btn"
            onClick={() => setShowAddModal(true)}
            className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white transition flex items-center gap-1 shadow-sm mr-2"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Resident</span>
          </button>

          {/* Create Home Button */}
          <button
            id="create-home-btn"
            onClick={() => setShowCreateHomeModal(true)}
            className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white transition flex items-center gap-1 shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create Home</span>
          </button>
        </div>

      </div>

      {/* Resident Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredResidents.map((r) => {
          const isOk = r.status === 'ok';
          const isHelp = r.status === 'not_ok';
          const isOverdue = r.status === 'overdue';

          let cardBorder = 'border-slate-200 hover:border-slate-300';
          let statusBadgeClass = 'bg-slate-100 text-slate-600';
          let statusText = 'Awaiting Check-in';

          if (isOk) {
            cardBorder = 'border-emerald-200 bg-emerald-50/20 hover:border-emerald-300';
            statusBadgeClass = 'bg-emerald-100 text-emerald-700 font-bold';
            statusText = `Checked in at ${r.checkInTime || '08:14 AM'}`;
          } else if (isHelp) {
            cardBorder = 'border-rose-300 bg-rose-50/40 hover:border-rose-400 ring-1 ring-rose-400';
            statusBadgeClass = 'bg-rose-100 text-rose-700 font-black animate-pulse';
            statusText = '🚨 NEEDS HELP';
          } else if (isOverdue) {
            cardBorder = 'border-amber-200 bg-amber-50/30 hover:border-amber-300';
            statusBadgeClass = 'bg-amber-100 text-amber-700 font-bold';
            statusText = '⚠️ CUTOFF PASSED';
          }

          return (
            <div
              key={r.id}
              className={`bg-white rounded-2xl p-5 border ${cardBorder} shadow-sm transition-all flex flex-col justify-between hover:shadow-md relative`}
            >
              <div>
                {/* Header row */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-base text-slate-900 hover:text-emerald-600 cursor-pointer"
                        onClick={() => setSelectedResident(r)}
                      >
                        {r.name}
                      </span>
                    </div>
                    <div className="text-xs text-slate-500 font-medium mt-0.5">
                      <span className="font-bold text-slate-800">{r.room}</span> · {r.wing}
                    </div>
                  </div>

                  <span className={`px-2.5 py-1 rounded-full text-[11px] uppercase tracking-wider ${statusBadgeClass}`}>
                    {statusText}
                  </span>
                </div>

                {/* Info strip */}
                <div className="mt-3 pt-3 border-t border-slate-100 grid grid-cols-2 gap-2 text-[11px] text-slate-500">
                  <div>
                    <span className="text-slate-400 block">Caregiver</span>
                    <span className="font-semibold text-slate-700">{r.caregiver}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Device Status</span>
                    <span className={`font-semibold flex items-center gap-1 ${
                      r.deviceLinked ? 'text-emerald-700' : 'text-amber-700'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${r.deviceLinked ? 'bg-emerald-600' : 'bg-amber-600'}`}></span>
                      {r.deviceLinked ? 'Paired (Active)' : 'Unlinked phone'}
                    </span>
                  </div>
                </div>

                {/* Medical alert badges if any */}
                {r.medicalAlerts && r.medicalAlerts.length > 0 && (
                  <div className="mt-2.5 flex flex-wrap gap-1">
                    {r.medicalAlerts.map((a, i) => (
                      <span key={i} className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md font-medium">
                        {a}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Action row */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                <button
                  onClick={() => onSelectResidentForPhone(r.id)}
                  className="text-xs font-bold text-emerald-700 hover:text-emerald-900 flex items-center gap-1 transition"
                  title="Simulate this resident's phone screen"
                >
                  <span>Test Phone View</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>

                <div className="flex items-center gap-1">
                  {!r.deviceLinked && (
                    <button
                      onClick={() => handleShareExistingResidentLink(r)}
                      className="px-2 py-1 rounded-lg text-xs font-semibold bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 flex items-center gap-1 transition"
                      title="Share verification link to attach phone to this care home"
                    >
                      <Link2 className="w-3 h-3" />
                      <span>Verify Link</span>
                    </button>
                  )}

                  {onOpenSeniorWebsite && (
                    <button
                      onClick={() => onOpenSeniorWebsite(r.id)}
                      className="p-1.5 rounded-lg text-emerald-700 hover:bg-emerald-50 hover:text-emerald-900 transition"
                      title="Open Senior Green/Red Web Check-In"
                    >
                      <Smartphone className="w-4 h-4" />
                    </button>
                  )}

                  <a
                    href={`tel:${r.phone}`}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
                    title={`Call ${r.phone}`}
                  >
                    <Phone className="w-4 h-4" />
                  </a>

                  <button
                    onClick={() => setSelectedResident(r)}
                    className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
                  >
                    Profile
                  </button>

                  {staff?.role === 'superadmin' && (
                    <>
                      <button
                        onClick={() => setEditingResident(r)}
                        className="px-2 py-1 rounded-lg text-xs font-semibold bg-indigo-50 hover:bg-indigo-100 text-indigo-700 transition"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => removeResident(r.id)}
                        className="px-2 py-1 rounded-lg text-xs font-semibold bg-rose-50 hover:bg-rose-100 text-rose-700 transition"
                      >
                        Delete
                      </button>
                    </>
                  )}
                </div>
              </div>

            </div>
          );
        })}
      </div>

      {filteredResidents.length === 0 && (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 text-slate-500">
          <p className="text-sm font-medium">No residents match your search or filter criteria.</p>
          <button
            onClick={() => { setSearchQuery(''); setStatusFilter('all'); setWingFilter('all'); }}
            className="mt-3 text-xs font-bold text-emerald-600 hover:underline"
          >
            Clear all filters
          </button>
        </div>
      )}

      {/* RESIDENT PROFILE DRAWER */}
      {selectedResident && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex justify-end">
          <div className="w-full max-w-md bg-white h-full shadow-2xl overflow-y-auto p-6 flex flex-col justify-between animate-in slide-in-from-right duration-200">
            <div>
              {/* Drawer Header */}
              <div className="flex items-start justify-between pb-4 border-b border-slate-100">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-xl font-bold text-slate-900">{selectedResident.name}</h3>
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-slate-100 text-slate-800">
                      {selectedResident.room}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">{selectedResident.wing}</p>
                </div>
                <button
                  onClick={() => setSelectedResident(null)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Status Banner */}
              <div className="mt-4 p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
                    Today&apos;s Status
                  </span>
                  <span className="text-sm font-black text-slate-900">
                    {selectedResident.status === 'ok' && 'Checked in OK'}
                    {selectedResident.status === 'not_ok' && 'Flagged for Help'}
                    {selectedResident.status === 'overdue' && 'Overdue (Cutoff Missed)'}
                    {selectedResident.status === 'awaiting' && 'Awaiting Morning Check-in'}
                  </span>
                  {selectedResident.checkInTime && (
                    <span className="text-xs text-slate-500 block mt-0.5">
                      Recorded: {selectedResident.checkInTime}
                    </span>
                  )}
                </div>

                {/* Direct quick toggle */}
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => {
                      onUpdateResidentStatus(selectedResident.id, 'ok');
                      setSelectedResident({ ...selectedResident, status: 'ok', checkInTime: currentTimeStr });
                      showToast(`Marked ${selectedResident.name} as OK`);
                    }}
                    className="p-2 rounded-xl bg-emerald-100 text-emerald-800 hover:bg-emerald-200 transition"
                    title="Mark OK"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      onUpdateResidentStatus(selectedResident.id, 'not_ok');
                      setSelectedResident({ ...selectedResident, status: 'not_ok', checkInTime: currentTimeStr });
                      showToast(`Flagged ${selectedResident.name} as needing help`);
                    }}
                    className="p-2 rounded-xl bg-rose-100 text-rose-800 hover:bg-rose-200 transition"
                    title="Flag for Help"
                  >
                    <AlertCircle className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* 7-Day Morning Verification History */}
              <div className="mt-5">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                  7-Day Morning Check-In History
                </h4>
                <div className="grid grid-cols-7 gap-1.5 text-center">
                  {(selectedResident.sevenDayHistory && selectedResident.sevenDayHistory.length > 0
                    ? selectedResident.sevenDayHistory
                    : [
                        { date: '2026-08-28', day: 'Fri', status: 'ok', time: '08:10 AM' },
                        { date: '2026-08-29', day: 'Sat', status: 'ok', time: '08:15 AM' },
                        { date: '2026-08-30', day: 'Sun', status: 'ok', time: '08:05 AM' },
                        { date: '2026-08-31', day: 'Mon', status: 'ok', time: '08:20 AM' },
                        { date: '2026-09-01', day: 'Tue', status: 'ok', time: '08:12 AM' },
                        { date: '2026-09-02', day: 'Wed', status: 'ok', time: '08:18 AM' },
                        { date: '2026-09-03', day: 'Today', status: selectedResident.status || 'awaiting' },
                      ]
                  ).map((h, i) => {
                    const isOk = h.status === 'ok';
                    const isHelp = h.status === 'not_ok';
                    const isOver = h.status === 'overdue';

                    let dotBg = 'bg-slate-100 text-slate-400';
                    if (isOk) dotBg = 'bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold';
                    else if (isHelp) dotBg = 'bg-rose-100 text-rose-800 border border-rose-300 font-bold';
                    else if (isOver) dotBg = 'bg-amber-100 text-amber-800 border border-amber-300 font-bold';

                    return (
                      <div key={i} className="flex flex-col items-center">
                        <span className="text-[10px] text-slate-400 mb-1">{h.day}</span>
                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs ${dotBg}`}>
                          {isOk && '✓'}
                          {isHelp && '!'}
                          {isOver && '✕'}
                          {h.status === 'awaiting' && '—'}
                        </div>
                        <span className="text-[9px] text-slate-400 mt-1 truncate max-w-[36px]">
                          {h.time ? h.time.split(' ')[0] : '—'}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Family & Emergency Contact Details */}
              <div className="mt-6 pt-5 border-t border-slate-100">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                  Family & Emergency Notification
                </h4>
                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-bold text-sm text-slate-800">
                        {selectedResident.emergencyContact?.name || 'Emergency Contact'}
                      </div>
                      <div className="text-xs text-slate-500">
                        {selectedResident.emergencyContact?.relationship || 'Family'} · {selectedResident.emergencyContact?.phone || 'No phone recorded'}
                      </div>
                    </div>
                    {selectedResident.emergencyContact?.phone && (
                      <a
                        href={`tel:${selectedResident.emergencyContact.phone}`}
                        className="p-2 rounded-xl bg-slate-200 text-slate-700 hover:bg-slate-300 transition"
                        title="Call family contact"
                      >
                        <Phone className="w-4 h-4" />
                      </a>
                    )}
                  </div>
                  <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-xs text-slate-600">
                    <span>SMS alert if morning missed:</span>
                    <span className="font-bold text-emerald-700">Enabled</span>
                  </div>
                </div>
              </div>

              {/* Medical notes */}
              <div className="mt-5">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                  Clinical & Caregiver Notes
                </h4>
                <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-200 leading-relaxed">
                  {selectedResident.notes || 'No special instructions recorded.'}
                </p>
              </div>

              {/* Device Safe-Link & Database Attachment */}
              <div className="mt-5">
                <div className="flex items-center justify-between mb-1.5">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Device Link & Facility Attachment
                  </h4>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    selectedResident.deviceLinked
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}>
                    {selectedResident.deviceLinked ? '✓ Attached in Database' : '⏳ Pending User Link'}
                  </span>
                </div>

                <div className="bg-slate-100 rounded-xl p-3 text-xs font-mono text-slate-700 break-all border border-slate-200">
                  {window.location.origin}/?verify={selectedResident.verificationToken || `ew_${selectedResident.id}`}&home={selectedResident.homeId || homeOrDefault.id}
                </div>

                <div className="mt-2 flex gap-2">
                  <button
                    onClick={() => handleShareExistingResidentLink(selectedResident)}
                    className="flex-1 py-2 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition"
                  >
                    <Link2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Copy Verification Invite</span>
                  </button>
                  {onOpenSeniorWebsite && (
                    <button
                      onClick={() => {
                        onOpenSeniorWebsite(selectedResident.id);
                        setSelectedResident(null);
                      }}
                      className="py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition"
                    >
                      <Smartphone className="w-3.5 h-3.5" />
                      <span>Senior Web View</span>
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Bottom Actions in Drawer */}
            <div className="pt-6 mt-6 border-t border-slate-100 flex gap-2">
              <button
                onClick={() => {
                  onSelectResidentForPhone(selectedResident.id);
                  setSelectedResident(null);
                }}
                className="flex-1 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition shadow-sm"
              >
                Open Resident Phone Simulator
              </button>
              <button
                onClick={() => setSelectedResident(null)}
                className="px-4 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ADD RESIDENT MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl border border-slate-200 text-slate-900 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-lg font-bold">Add New Resident</h3>
                <p className="text-xs text-slate-500">Configure room, contact, and 1-tap phone link</p>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateResident} className="space-y-4 py-4">
              <div>
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
                  Assign to Care Home Facility *
                </label>
                <select
                  id="new-resident-home-select"
                  value={selectedHomeForResident}
                  onChange={(e) => setSelectedHomeForResident(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer bg-white text-slate-900"
                >
                  {(allHomes || [homeOrDefault]).map((h) => (
                    <option key={h.id} value={h.id}>
                      {h.name} ({h.location})
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-slate-500 mt-1">
                  Stored in database per home. The resident will verify via link to attach their device to this facility.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
                    Resident Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Eleanor Vance"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white text-slate-900"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
                    Room / Cottage *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Room 16"
                    value={newRoom}
                    onChange={(e) => setNewRoom(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white text-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
                    Wing / Section
                  </label>
                  <input
                    id="new-resident-wing-input"
                    type="text"
                    placeholder="e.g. Willow Cottage"
                    value={newWing}
                    onChange={(e) => setNewWing(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white text-slate-900"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
                    Resident Mobile Phone *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="+27 82 555 0000"
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white text-slate-900"
                  />
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100">
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                  Emergency Family Contact
                </h4>
                <div className="grid grid-cols-3 gap-2">
                  <div className="col-span-1">
                    <input
                      type="text"
                      placeholder="Contact Name"
                      value={newContactName}
                      onChange={(e) => setNewContactName(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white text-slate-900"
                    />
                  </div>
                  <div className="col-span-1">
                    <input
                      type="text"
                      placeholder="Relationship (Daughter)"
                      value={newContactRel}
                      onChange={(e) => setNewContactRel(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white text-slate-900"
                    />
                  </div>
                  <div className="col-span-1">
                    <input
                      type="tel"
                      placeholder="Contact Phone"
                      value={newContactPhone}
                      onChange={(e) => setNewContactPhone(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white text-slate-900"
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-2 pt-3">
                <button
                  type="submit"
                  className="flex-1 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition shadow-sm"
                >
                  Save & Generate Device Link
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EXPORT MORNING AUDIT REPORT MODAL */}
      {showExportModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl border border-slate-200 text-slate-900">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-lg font-bold">Morning Verification Audit Log</h3>
                <p className="text-xs text-slate-500">Official log for care facility records & family reassurance</p>
              </div>
              <button
                onClick={() => setShowExportModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="py-4">
              <div className="bg-slate-900 text-slate-100 p-4 rounded-2xl font-mono text-xs overflow-x-auto max-h-60 leading-relaxed border border-slate-800">
                <div># ELDERWATCH MORNING AUDIT REPORT</div>
                <div>FACILITY: {homeOrDefault.name}</div>
                <div>DATE: {new Date().toISOString().split('T')[0]} · CUTOFF: {homeOrDefault.cutoffTime} AM</div>
                <div>DUTY NURSE: {homeOrDefault.primaryNurse}</div>
                <div>------------------------------------------------</div>
                <div>TOTAL RESIDENTS: {totalCount}</div>
                <div>CONFIRMED OK: {okCount}</div>
                <div>NEEDS ASSISTANCE: {notOkCount}</div>
                <div>OVERDUE / DOOR CHECK: {overdueCount}</div>
                <div>------------------------------------------------</div>
                {residents.map((r, idx) => (
                  <div key={idx}>
                    [{r.room}] {r.name.padEnd(22, ' ')} : {r.status.toUpperCase()} ({r.checkInTime || 'Pending'})
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => {
                  navigator.clipboard?.writeText?.(
                  `ELDERWATCH MORNING REPORT\nFacility: ${homeOrDefault.name}\nDate: ${new Date().toLocaleDateString()}\nVerified OK: ${okCount}/${totalCount}\nUrgent Attention: ${notOkCount}\nOverdue: ${overdueCount}`
                  );
                  alert('Morning audit summary copied to clipboard!');
                }}
                className="flex-1 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition shadow-sm"
              >
                Copy Report Summary
              </button>
              <button
                onClick={() => setShowExportModal(false)}
                className="px-4 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* VERIFICATION LINK & SMS INVITATION MODAL */}
      {createdVerificationData && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 text-slate-900 animate-in fade-in zoom-in-95">
            <div className="flex items-start justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                  <Link2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900">
                    Verification Link Generated
                  </h3>
                  <p className="text-xs text-slate-500">
                    Database record stored for {createdVerificationData.homeName}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setCreatedVerificationData(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="py-4 space-y-4">
              {/* Resident Summary Pill */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 flex items-center justify-between text-xs">
                <div>
                  <span className="text-slate-400 block text-[11px]">Resident & Mobile</span>
                  <span className="font-bold text-slate-900 text-sm">{createdVerificationData.residentName}</span>
                  <span className="text-slate-500 block">{createdVerificationData.phone} · {createdVerificationData.room}</span>
                </div>
                <div className="text-right">
                  <span className="text-slate-400 block text-[11px]">Facility Attached</span>
                  <span className="font-bold text-emerald-700">{createdVerificationData.homeName}</span>
                  <span className="inline-flex items-center gap-1 text-[10px] text-amber-700 bg-amber-100 font-semibold px-2 py-0.5 rounded-full mt-1">
                    Waiting for link click
                  </span>
                </div>
              </div>

              {/* Verification Link Field */}
              <div>
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
                  1-Click Resident Mobile Verification URL
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    readOnly
                    value={createdVerificationData.verificationUrl}
                    className="flex-1 px-3 py-2 text-xs font-mono rounded-xl border border-slate-300 bg-slate-50 text-slate-800 select-all"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard?.writeText(createdVerificationData.verificationUrl);
                      setCopiedLink(true);
                      setTimeout(() => setCopiedLink(false), 3000);
                      showToast('Verification URL copied to clipboard');
                    }}
                    className="px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center gap-1.5 transition"
                  >
                    {copiedLink ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                    <span>{copiedLink ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
              </div>

              {/* Precomposed SMS / WhatsApp Message */}
              <div>
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
                  Precomposed SMS / WhatsApp Invitation
                </label>
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs text-slate-700 italic">
                  "Good day {createdVerificationData.residentName.split(' ')[0]}! Welcome to {createdVerificationData.homeName}. Please tap this link on your cell phone to activate your morning reassurance check-in: {createdVerificationData.verificationUrl}"
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const smsText = `Good day ${createdVerificationData.residentName.split(' ')[0]}! Welcome to ${createdVerificationData.homeName}. Please tap this link on your cell phone to activate your morning reassurance check-in: ${createdVerificationData.verificationUrl}`;
                    navigator.clipboard?.writeText(smsText);
                    setCopiedSms(true);
                    setTimeout(() => setCopiedSms(false), 3000);
                    showToast('SMS message copied to clipboard');
                  }}
                  className="mt-2 text-xs font-bold text-emerald-700 hover:text-emerald-900 flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{copiedSms ? '✓ SMS text copied!' : 'Copy SMS / WhatsApp message text'}</span>
                </button>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row gap-2">
                <button
                  type="button"
                  onClick={() => {
                    if (onOpenSeniorWebsite) {
                      onOpenSeniorWebsite(createdVerificationData.residentId);
                    } else {
                      window.open(createdVerificationData.verificationUrl, '_blank');
                    }
                    setCreatedVerificationData(null);
                  }}
                  className="flex-1 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>Test Senior Client Website (Green & Red Buttons)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setCreatedVerificationData(null)}
                  className="py-3 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CREATE HOME MODAL */}
      {showCreateHomeModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
            <div className="flex items-center justify-between p-6 border-b">
              <div>
                <h3 className="text-lg font-bold">Create New Home</h3>
                <p className="text-xs text-slate-500">Add a care home, then assign a home admin in Staff Management.</p>
              </div>
              <button onClick={() => setShowCreateHomeModal(false)} className="p-2 hover:bg-slate-100 rounded-lg"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={createHome} className="p-6 space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">Home ID *</label>
                <input className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white text-slate-900" placeholder="e.g. home-pretoria-03" value={newHomeId} onChange={(e) => setNewHomeId(e.target.value)} required />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">Home Name *</label>
                <input className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white text-slate-900" placeholder="e.g. Pretoria Frail Care" value={newHomeName} onChange={(e) => setNewHomeName(e.target.value)} required />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">Location</label>
                <input className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white text-slate-900" placeholder="e.g. Hatfield, Pretoria" value={newHomeLocation} onChange={(e) => setNewHomeLocation(e.target.value)} />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">Cutoff Time</label>
                <input className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white text-slate-900" placeholder="09:00" value={newHomeCutoff} onChange={(e) => setNewHomeCutoff(e.target.value)} />
              </div>
              <div className="flex gap-2 pt-2">
                <button type="submit" disabled={creatingHome} className="flex-1 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition shadow-sm disabled:opacity-60">
                  {creatingHome ? 'Creating...' : 'Create Home'}
                </button>
                <button type="button" onClick={() => setShowCreateHomeModal(false)} className="px-4 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT HOME MODAL */}
      {editingHome && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
            <div className="flex items-center justify-between p-6 border-b">
              <div>
                <h3 className="text-lg font-bold">Edit Home</h3>
                <p className="text-xs text-slate-500">Update home details.</p>
              </div>
              <button onClick={() => setEditingHome(null)} className="p-2 hover:bg-slate-100 rounded-lg"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={saveEditingHome} className="p-6 space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">Name</label>
                <input className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white text-slate-900" value={editingHome.name} onChange={(e) => setEditingHome({ ...editingHome, name: e.target.value })} required />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">Location</label>
                <input className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white text-slate-900" value={editingHome.location} onChange={(e) => setEditingHome({ ...editingHome, location: e.target.value })} />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">Cutoff Time</label>
                <input className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white text-slate-900" value={editingHome.cutoffTime} onChange={(e) => setEditingHome({ ...editingHome, cutoffTime: e.target.value })} />
              </div>
              <div className="flex gap-2 pt-2">
                <button type="submit" className="flex-1 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs transition">Save Changes</button>
                <button type="button" onClick={() => setEditingHome(null)} className="px-4 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT RESIDENT MODAL */}
      {editingResident && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
            <div className="flex items-center justify-between p-6 border-b">
              <div>
                <h3 className="text-lg font-bold">Edit Resident</h3>
                <p className="text-xs text-slate-500">Update resident info or home assignment.</p>
              </div>
              <button onClick={() => setEditingResident(null)} className="p-2 hover:bg-slate-100 rounded-lg"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={saveEditingResident} className="p-6 space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">Name</label>
                <input className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white text-slate-900" value={editingResident.name} onChange={(e) => setEditingResident({ ...editingResident, name: e.target.value })} required />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">Room</label>
                  <input className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white text-slate-900" value={editingResident.room} onChange={(e) => setEditingResident({ ...editingResident, room: e.target.value })} />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">Wing</label>
                  <input className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white text-slate-900" value={editingResident.wing} onChange={(e) => setEditingResident({ ...editingResident, wing: e.target.value })} />
                </div>
              </div>
              <div>
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">Phone</label>
                <input className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white text-slate-900" value={editingResident.phone} onChange={(e) => setEditingResident({ ...editingResident, phone: e.target.value })} />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">Caregiver</label>
                <input className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white text-slate-900" value={editingResident.caregiver} onChange={(e) => setEditingResident({ ...editingResident, caregiver: e.target.value })} />
              </div>
              <div className="flex gap-2 pt-2">
                <button type="submit" className="flex-1 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs transition">Save Changes</button>
                <button type="button" onClick={() => setEditingResident(null)} className="px-4 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
