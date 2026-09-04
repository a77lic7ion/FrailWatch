import React from 'react';
import { 
  Sliders, 
  X, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  RotateCcw, 
  Flame, 
  Send,
  Zap
} from 'lucide-react';
import { Resident, CheckInStatus } from '../types';

interface SimulationModalProps {
  isOpen: boolean;
  onClose: () => void;
  residents: Resident[];
  onTriggerStatus: (residentId: string, status: CheckInStatus) => void;
  onFastForwardCutoff: () => void;
  onSimulateAllOk: () => void;
  onResetMorning: () => void;
}

export const SimulationModal: React.FC<SimulationModalProps> = ({
  isOpen,
  onClose,
  residents,
  onTriggerStatus,
  onFastForwardCutoff,
  onSimulateAllOk,
  onResetMorning,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-[#0b1118]/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-[#0f1722] rounded-3xl p-6 max-w-lg w-full shadow-2xl border border-[#1e293b] text-[#e2e8f0] animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#1e293b]">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-amber-50 text-amber-800 border border-amber-200">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-[#e2e8f0]">Live Scenario Simulator</h3>
              <p className="text-xs text-[#94a3b8]">Test how the layout and triage dashboard respond in real time</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#94a3b8] hover:text-[#94a3b8]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="py-4 space-y-3">
          
          {/* Quick Scenario 1: Trigger Help */}
          <button
            onClick={() => {
              const res = residents.find((r) => r.status !== 'not_ok') || residents[1];
              onTriggerStatus(res.id, 'not_ok');
              onClose();
            }}
            className="w-full p-3.5 rounded-2xl bg-rose-50 hover:bg-rose-100 text-rose-950 border border-rose-200 text-left transition flex items-center justify-between group"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-rose-600 text-[#e2e8f0] flex items-center justify-center font-bold shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <div className="font-bold text-xs">Simulate Emergency: Resident Taps &quot;I Need Help&quot;</div>
                <div className="text-[11px] text-rose-700">Triggers high-priority triage queue and alerts duty nurse</div>
              </div>
            </div>
            <Zap className="w-4 h-4 text-rose-500 group-hover:translate-x-0.5 transition-transform" />
          </button>

          {/* Quick Scenario 2: Fast forward cutoff */}
          <button
            onClick={() => {
              onFastForwardCutoff();
              onClose();
            }}
            className="w-full p-3.5 rounded-2xl bg-amber-50 hover:bg-amber-100 text-amber-950 border border-amber-200 text-left transition flex items-center justify-between group"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-500 text-[#e2e8f0] flex items-center justify-center font-bold shrink-0">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <div className="font-bold text-xs">Fast-Forward Past 09:15 AM Cutoff</div>
                <div className="text-[11px] text-amber-800">Auto-flags all unresponded residents into door-check list</div>
              </div>
            </div>
            <Zap className="w-4 h-4 text-amber-600 group-hover:translate-x-0.5 transition-transform" />
          </button>

          {/* Quick Scenario 3: All checked in ok */}
          <button
            onClick={() => {
              onSimulateAllOk();
              onClose();
            }}
            className="w-full p-3.5 rounded-2xl bg-emerald-50 hover:bg-emerald-100 text-emerald-950 border border-emerald-200 text-left transition flex items-center justify-between group"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-600 text-[#e2e8f0] flex items-center justify-center font-bold shrink-0">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <div className="font-bold text-xs">Simulate All Residents Checked In OK</div>
                <div className="text-[11px] text-emerald-700">Experience a 100% verified morning round</div>
              </div>
            </div>
            <Zap className="w-4 h-4 text-emerald-600 group-hover:translate-x-0.5 transition-transform" />
          </button>

          {/* Quick Scenario 4: Reset morning */}
          <button
            onClick={() => {
              onResetMorning();
              onClose();
            }}
            className="w-full p-3.5 rounded-2xl bg-[#141d27] hover:bg-[#141d27] text-[#e2e8f0] border border-[#1e293b] text-left transition flex items-center justify-between group"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#131d27] text-[#e2e8f0] flex items-center justify-center font-bold shrink-0">
                <RotateCcw className="w-5 h-5" />
              </div>
              <div>
                <div className="font-bold text-xs">Reset Morning to 07:00 AM Initial State</div>
                <div className="text-[11px] text-[#94a3b8]">Restore default demo residents and pending checkins</div>
              </div>
            </div>
            <Zap className="w-4 h-4 text-[#94a3b8] group-hover:translate-x-0.5 transition-transform" />
          </button>

        </div>

        <div className="pt-3 border-t border-[#1e293b] flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-[#141d27] hover:bg-[#141d27] text-[#e2e8f0] font-bold text-xs transition"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
