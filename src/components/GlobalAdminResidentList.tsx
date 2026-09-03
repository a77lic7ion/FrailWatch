import React, { useState, useMemo } from 'react';
import { Users, Search, UserCog, ArrowLeft } from 'lucide-react';
import { Resident, CareHome } from '../types';

interface GlobalAdminResidentListProps {
  home: CareHome;
  residents: Resident[];
  onBack: () => void;
  onOpenStaffManagement: () => void;
}

export function GlobalAdminResidentList({ home, residents, onBack, onOpenStaffManagement }: GlobalAdminResidentListProps) {
  const [query, setQuery] = useState('');
  const scoped = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = residents.filter((r) => r.homeId === home.id);
    if (!q) return list;
    return list.filter((r) => (r.name || '').toLowerCase().includes(q) || (r.room || '').toLowerCase().includes(q) || (r.phone || '').includes(q));
  }, [residents, home.id, query]);

  return (
    <div className="max-w-4xl mx-auto px-3 sm:px-6 py-6 space-y-4">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <button onClick={onBack} className="inline-flex items-center gap-1 text-xs font-semibold text-slate-600 hover:text-slate-900">
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
          <div>
            <h2 className="text-lg font-bold text-slate-900">{home.name}</h2>
            <p className="text-xs text-slate-500">{home.location || ''} · Residents: {scoped.length}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={onOpenStaffManagement} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 text-white text-xs font-bold">
            <UserCog className="w-3.5 h-3.5" /> Staff
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm divide-y">
        <div className="p-3 flex items-center gap-2">
          <Search className="w-4 h-4 text-slate-500" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search residents..."
            className="w-full text-sm focus:outline-none"
          />
        </div>
        {scoped.length === 0 && (
          <div className="p-6 text-center text-xs text-slate-500">No residents match.</div>
        )}
        {scoped.map((r) => (
          <div key={r.id} className="px-4 py-3 flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-900">{r.name}</p>
              <p className="text-xs text-slate-500">{r.room || 'No room'} · {r.wing || ''}</p>
            </div>
            <div className="text-right">
              <p className="text-xs font-medium text-slate-700">{r.status === 'not_ok' ? 'Needs help' : r.status === 'overdue' ? 'Overdue' : r.status === 'awaiting' ? 'Awaiting' : 'OK'}</p>
              {r.phone && <p className="text-[11px] text-slate-500">{r.phone}</p>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
