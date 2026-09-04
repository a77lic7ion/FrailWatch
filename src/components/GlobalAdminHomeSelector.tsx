import React, { useState, useEffect } from 'react';
import { Building2, Users, UserCheck, AlertCircle, Clock, ArrowRight, ChevronRight } from 'lucide-react';
import { CareHome, Resident } from '../types';
import { api } from '../services/api';

interface GlobalAdminHomeSelectorProps {
  homes: CareHome[];
  onSelectHome: (homeId: string) => void;
}

export function GlobalAdminHomeSelector({ homes, onSelectHome }: GlobalAdminHomeSelectorProps) {
  const [selectedHomeId, setSelectedHomeId] = useState<string>(homes[0]?.id || '');

  const handleContinue = () => {
    if (selectedHomeId) {
      onSelectHome(selectedHomeId);
    }
  };

  return (
    <div className="min-h-screen bg-[#0f1722] flex flex-col items-center justify-center p-6">
      <div className="max-w-2xl w-full">
        <div className="text-center mb-8">
          <Building2 className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
          <h1 className="text-3xl font-bold text-[#e2e8f0] mb-2">Select a Home</h1>
          <p className="text-sm text-[#94a3b8]">Choose a facility to view its weekly stats and manage staff/residents.</p>
        </div>

        <div className="bg-[#0f1722] rounded-2xl border border-[#1e293b] shadow-sm p-6 space-y-4">
          <label className="text-xs font-bold text-[#e2e8f0] uppercase tracking-wider block mb-2">
            Available Homes
          </label>
          <div className="space-y-2">
            {homes.map((home) => (
              <button
                key={home.id}
                onClick={() => setSelectedHomeId(home.id)}
                className={`w-full text-left px-4 py-3 rounded-xl border-2 transition flex items-center justify-between ${
                  selectedHomeId === home.id
                    ? 'border-emerald-500 bg-emerald-500/10'
                    : 'border-[#1e293b] hover:border-[#223040] bg-[#0f1722]'
                }`}
              >
                <div>
                  <p className="text-sm font-bold text-[#e2e8f0]">{home.name}</p>
                  <p className="text-xs text-[#94a3b8]">{home.location || 'No location'} · ID: {home.id}</p>
                </div>
                {selectedHomeId === home.id && (
                  <ChevronRight className="w-5 h-5 text-emerald-400" />
                )}
              </button>
            ))}
            {!homes.length && (
              <p className="text-xs text-[#94a3b8] text-center py-4">No homes found. Create a home first.</p>
            )}
          </div>

          <button
            onClick={handleContinue}
            disabled={!selectedHomeId}
            className="w-full mt-4 px-4 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-[#e2e8f0] font-bold text-sm disabled:opacity-50 transition flex items-center justify-center gap-2"
          >
            Continue <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
