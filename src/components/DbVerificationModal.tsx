import React, { useEffect, useState } from 'react';
import { X, Database, RefreshCw } from 'lucide-react';
import { api } from '../services/api';

interface DbVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function DbVerificationModal({ isOpen, onClose }: DbVerificationModalProps) {
  const [status, setStatus] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadStatus = async () => {
    setLoading(true);
    setError(null);
    try {
      const s = await api.getStatus();
      setStatus(s);
    } catch (e: any) {
      setError(e.message || 'Failed to load database status');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadStatus();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Database className="w-5 h-5" /> Firebase Connection Verification
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Verify Firestore connectivity and data access for this admin session.
            </p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {error && <p className="text-sm text-red-600">{error}</p>}

          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-slate-700">Connection Status</span>
            <span
              className={`px-2.5 py-1 rounded-full text-xs font-bold border ${
                status?.firebaseConnected
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : 'bg-rose-50 text-rose-700 border-rose-200'
              }`}
            >
              {loading ? 'Checking...' : status?.firebaseConnected ? 'Connected' : 'Disconnected'}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Project</div>
              <div className="text-sm font-mono text-slate-900 mt-1">{status?.projectId || '-'}</div>
            </div>
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Residents</div>
              <div className="text-sm font-black text-slate-900 mt-1">{status?.residentCount ?? '-'}</div>
            </div>
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Client Email</div>
              <div className="text-xs text-slate-900 mt-1 break-all">{status?.clientEmail || '-'}</div>
            </div>
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Error</div>
              <div className="text-xs text-slate-900 mt-1">{status?.error || 'None'}</div>
            </div>
          </div>

          <button
            onClick={loadStatus}
            className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 shadow-xs transition"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Refresh Verification
          </button>
        </div>
      </div>
    </div>
  );
}
