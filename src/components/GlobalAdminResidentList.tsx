import React, { useState, useMemo } from 'react';
import { Users, Search, UserCog, ArrowLeft, Trash2 } from 'lucide-react';
import { Resident, CareHome } from '../types';
import { api } from '../services/api';

interface GlobalAdminResidentListProps {
  home: CareHome;
  residents: Resident[];
  onBack: () => void;
  onOpenStaffManagement: () => void;
  onDeleteResident?: (id: string) => Promise<boolean> | boolean;
}

export function GlobalAdminResidentList({ home, residents, onBack, onOpenStaffManagement, onDeleteResident }: GlobalAdminResidentListProps) {
  const [query, setQuery] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const scoped = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = residents.filter((r) => r.homeId === home.id);
    if (!q) return list;
    return list.filter((r) => (r.name || '').toLowerCase().includes(q) || (r.room || '').toLowerCase().includes(q) || (r.phone || '').includes(q));
  }, [residents, home.id, query]);

  const handleDelete = async (id: string) => {
    if (!window.confirm('Remove this resident?')) return;
    setDeletingId(id);
    try {
      const ok = onDeleteResident ? await onDeleteResident(id) : await api.deleteResident(id);
      if (!ok) alert('Failed to delete resident');
    } catch (e: any) {
      alert(e?.message || 'Failed to delete resident');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-3 sm:px-6 py-6 space-y-4">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <button onClick={onBack} className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-700 hover:text-indigo-900 bg-indigo-50 hover:bg-indigo-100 px-2.5 py-1.5 rounded-lg border border-indigo-200">
            <ArrowLeft className="w-4 h-4" /> Back to home list
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
          <div key={r.id} className="px-4 py-3 flex items-center justify-between gap-2">
            <div>
              <p className="text-sm font-semibold text-slate-900">{r.name}</p>
              <p className="text-xs text-slate-500">{r.room || 'No room'} · {r.wing || ''}</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-xs font-medium text-slate-700">{r.status === 'not_ok' ? 'Needs help' : r.status === 'overdue' ? 'Overdue' : r.status === 'awaiting' ? 'Awaiting' : 'OK'}</p>
                {r.phone && <p className="text-[11px] text-slate-500">{r.phone}</p>}
              </div>
              <button
                onClick={() => handleDelete(r.id)}
                disabled={deletingId === r.id}
                className="p-2 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 disabled:opacity-50"
                title="Delete resident"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
