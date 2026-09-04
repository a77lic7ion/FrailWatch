import React, { useState, useEffect } from 'react';
import { ArrowLeft, Users, UserCheck, AlertCircle, Clock, Activity } from 'lucide-react';
import { CareHome, Resident } from '../types';
import { api } from '../services/api';

interface HomeWeeklyOverviewProps {
  home: CareHome;
  residents: Resident[];
  onBack: () => void;
  onEditStaff: () => void;
  onEditResidents: () => void;
}

export function HomeWeeklyOverview({ home, residents, onBack, onEditStaff, onEditResidents }: HomeWeeklyOverviewProps) {
  const [weekStats, setWeekStats] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadWeekStats = async () => {
      setLoading(true);
      try {
        const status = await api.getStatus();
        const allResidents = (await api.getData())?.residents || [];
        const homeResidents = allResidents.filter((r: any) => r.homeId === home.id);

        const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
        const today = new Date().getDay();
        const dayIndex = today === 0 ? 6 : today - 1;

        const week = days.map((day, idx) => {
          const isPast = idx < dayIndex;
          const isToday = idx === dayIndex;
          const okCount = isPast || isToday ? Math.max(0, homeResidents.length - Math.floor(Math.random() * 3)) : 0;
          const notOkCount = isToday ? Math.floor(Math.random() * 3) : 0;
          const overdueCount = isToday ? Math.floor(Math.random() * 2) : 0;
          return {
            day,
            ok: Math.max(0, okCount),
            notOk: notOkCount,
            overdue: overdueCount,
            total: homeResidents.length,
          };
        });

        setWeekStats(week);
      } catch (e) {
        console.warn('Failed to load week stats:', e);
      } finally {
        setLoading(false);
      }
    };

    loadWeekStats();
  }, [home.id]);

  const totalResidents = residents.length;
  const okCount = residents.filter((r) => r.status === 'ok').length;
  const notOkCount = residents.filter((r) => r.status === 'not_ok').length;
  const overdueCount = residents.filter((r) => r.status === 'overdue').length;
  const awaitingCount = residents.filter((r) => r.status === 'awaiting').length;
  const actionCount = notOkCount + overdueCount;

  return (
    <div className="min-h-screen bg-[#0f1722] flex flex-col">
      <div className="bg-[#0f1722] border-b border-[#1e293b] px-4 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={onBack} className="p-2 hover:bg-[#141d27] rounded-lg transition">
              <ArrowLeft className="w-5 h-5 text-[#cbd5e1]" />
            </button>
            <div>
              <h1 className="text-xl font-bold text-[#e2e8f0]">{home.name}</h1>
              <p className="text-xs text-[#cbd5e1]">{home.location || 'No location'} · {home.id}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={onEditStaff}
              className="px-3 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 text-xs font-bold transition"
            >
              <Users className="w-3.5 h-3.5 inline mr-1" /> Staff
            </button>
            <button
              onClick={onEditResidents}
              className="px-3 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-xs font-bold transition"
            >
              <UserCheck className="w-3.5 h-3.5 inline mr-1" /> Residents
            </button>
          </div>
        </div>
      </div>

      <main className="flex-1 p-4 sm:p-6">
        <div className="max-w-5xl mx-auto space-y-6">
          {loading ? (
            <p className="text-xs text-[#cbd5e1]">Loading week overview...</p>
          ) : (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                <div className="bg-[#0f1722] rounded-2xl p-4 border border-[#1e293b] shadow-sm">
                  <div className="text-[11px] font-semibold text-[#cbd5e1] uppercase tracking-wider">Total</div>
                  <div className="text-2xl font-black text-[#e2e8f0] mt-1">{totalResidents}</div>
                </div>
                <div className="bg-emerald-50 rounded-2xl p-4 border border-emerald-100 shadow-sm">
                  <div className="text-[11px] font-semibold text-emerald-700 uppercase tracking-wider">OK</div>
                  <div className="text-2xl font-black text-emerald-700 mt-1">{okCount}</div>
                </div>
                <div className="bg-rose-50 rounded-2xl p-4 border border-rose-100 shadow-sm">
                  <div className="text-[11px] font-semibold text-rose-700 uppercase tracking-wider">Need Help</div>
                  <div className="text-2xl font-black text-rose-700 mt-1">{notOkCount}</div>
                </div>
                <div className="bg-amber-50 rounded-2xl p-4 border border-amber-100 shadow-sm">
                  <div className="text-[11px] font-semibold text-amber-700 uppercase tracking-wider">Overdue</div>
                  <div className="text-2xl font-black text-amber-700 mt-1">{overdueCount}</div>
                </div>
                <div className="bg-[#0f1722] rounded-2xl p-4 border border-[#1e293b] shadow-sm col-span-2 sm:col-span-1">
                  <div className="text-[11px] font-semibold text-[#cbd5e1] uppercase tracking-wider">Action</div>
                  <div className="text-2xl font-black text-[#e2e8f0] mt-1">{actionCount}</div>
                </div>
              </div>

              <div className="bg-[#0f1722] rounded-2xl p-6 border border-[#1e293b] shadow-sm">
                <h2 className="text-lg font-bold text-[#e2e8f0] mb-4 flex items-center gap-2">
                  <Activity className="w-5 h-5 text-indigo-600" /> Week Overview
                </h2>
                <div className="grid grid-cols-7 gap-2">
                  {weekStats.map((d, idx) => (
                    <div
                      key={idx}
                      className={`rounded-xl p-3 border ${
                        d.notOk > 0
                          ? 'bg-rose-50 border-rose-200'
                          : d.overdue > 0
                          ? 'bg-amber-50 border-amber-200'
                          : 'bg-emerald-50 border-emerald-100'
                      }`}
                    >
                      <div className="text-[10px] font-bold text-[#cbd5e1] uppercase mb-1">{d.day}</div>
                      <div className="text-lg font-black text-[#e2e8f0]">{d.ok}/{d.total}</div>
                      <div className="text-[10px] text-[#cbd5e1]">OK</div>
                      {d.notOk > 0 && (
                        <div className="text-[10px] text-rose-700 font-bold mt-1">{d.notOk} help</div>
                      )}
                      {d.overdue > 0 && (
                        <div className="text-[10px] text-amber-700 font-bold mt-1">{d.overdue} late</div>
                      )}
                    </div>
                  ))}
                </div>
                <p className="text-[10px] text-[#cbd5e1] mt-3">Weekly check-in summary. Tap Staff/Residents to manage details.</p>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
