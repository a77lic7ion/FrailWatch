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
      <div className="bg-[#0f1722] rounded-2xl shadow-2xl w-full max-w-lg">
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Database className="w-5 h-5" /> Firebase Connection Verification
            </h2>
            <p className="text-xs text-[#cbd5e1] mt-1">
              Verify Firestore connectivity and data access for this admin session.
            </p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-[#141d27] rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {error && <p className="text-sm text-red-600">{error}</p>}

          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-[#e2e8f0]">Connection Status</span>
            <span
              className={`px-2.5 py-1 rounded-full text-xs font-bold border ${
                status?.firebaseConnected
                  ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                  : 'bg-rose-500/15 text-rose-400 border-rose-500/30'
              }`}
            >
              {loading ? 'Checking...' : status?.firebaseConnected ? 'Connected' : 'Disconnected'}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-[#0f1722] border border-[#1e293b] rounded-xl p-3">
              <div className="text-[11px] font-bold uppercase tracking-wider text-[#cbd5e1]">Project</div>
              <div className="text-sm font-mono text-[#e2e8f0] mt-1">{status?.projectId || '-'}</div>
            </div>
            <div className="bg-[#0f1722] border border-[#1e293b] rounded-xl p-3">
              <div className="text-[11px] font-bold uppercase tracking-wider text-[#cbd5e1]">Residents</div>
              <div className="text-sm font-black text-[#e2e8f0] mt-1">{status?.residentCount ?? '-'}</div>
            </div>
            <div className="bg-[#0f1722] border border-[#1e293b] rounded-xl p-3">
              <div className="text-[11px] font-bold uppercase tracking-wider text-[#cbd5e1]">Client Email</div>
              <div className="text-xs text-[#e2e8f0] mt-1 break-all">{status?.clientEmail || '-'}</div>
            </div>
            <div className="bg-[#0f1722] border border-[#1e293b] rounded-xl p-3">
              <div className="text-[11px] font-bold uppercase tracking-wider text-[#cbd5e1]">Error</div>
              <div className="text-xs text-[#e2e8f0] mt-1">{status?.error || 'None'}</div>
            </div>
          </div>

          <button
            onClick={loadStatus}
            className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[#0f1722] hover:bg-[#141d27] text-[#e2e8f0] border border-[#1e293b] shadow-xs transition"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Refresh Verification
          </button>
        </div>
      </div>
    </div>
  );
}
