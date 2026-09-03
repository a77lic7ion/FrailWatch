import React, { useState } from 'react';
import { Clock, X, Check } from 'lucide-react';
import { CareHome } from '../types';

interface CutoffModalProps {
  isOpen: boolean;
  onClose: () => void;
  home: CareHome;
  onSaveCutoff: (newCutoff: string) => void;
}

export const CutoffModal: React.FC<CutoffModalProps> = ({
  isOpen,
  onClose,
  home,
  onSaveCutoff,
}) => {
  const [cutoffVal, setCutoffVal] = useState(home.cutoffTime);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveCutoff(cutoffVal);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-slate-200 text-slate-900 animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-amber-50 text-amber-800 border border-amber-200">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base">Adjust Morning Cutoff</h3>
              <p className="text-xs text-slate-500">{home.name}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="py-5 space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-2">
              Cutoff Time (Staff review start)
            </label>
            <input
              type="time"
              required
              value={cutoffVal}
              onChange={(e) => setCutoffVal(e.target.value)}
              className="w-full text-center text-2xl font-mono font-black py-3 rounded-2xl bg-slate-50 border-2 border-slate-200 focus:border-emerald-600 focus:bg-white focus:outline-none"
            />
            <p className="text-xs text-slate-500 mt-2 leading-relaxed">
              Any resident who has not tapped &quot;I&apos;m okay&quot; by this time will be immediately flagged for physical room verification.
            </p>
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="submit"
              className="flex-1 py-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs transition flex items-center justify-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>Update Cutoff</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
