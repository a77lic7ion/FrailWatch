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
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6">
      <div className="max-w-2xl w-full">
        <div className="text-center mb-8">
          <Building2 className="w-12 h-12 text-indigo-600 mx-auto mb-3" />
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Select a Home</h1>
          <p className="text-sm text-slate-500">Choose a facility to view its weekly stats and manage staff/residents.</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
          <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-2">
            Available Homes
          </label>
          <div className="space-y-2">
            {homes.map((home) => (
              <button
                key={home.id}
                onClick={() => setSelectedHomeId(home.id)}
                className={`w-full text-left px-4 py-3 rounded-xl border-2 transition flex items-center justify-between ${
                  selectedHomeId === home.id
                    ? 'border-indigo-500 bg-indigo-50'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div>
                  <p className="text-sm font-bold text-slate-900">{home.name}</p>
                  <p className="text-xs text-slate-500">{home.location || 'No location'} · ID: {home.id}</p>
                </div>
                {selectedHomeId === home.id && (
                  <ChevronRight className="w-5 h-5 text-indigo-600" />
                )}
              </button>
            ))}
            {!homes.length && (
              <p className="text-xs text-slate-500 text-center py-4">No homes found. Create a home first.</p>
            )}
          </div>

          <button
            onClick={handleContinue}
            disabled={!selectedHomeId}
            className="w-full mt-4 px-4 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm disabled:opacity-50 transition flex items-center justify-center gap-2"
          >
            Continue <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
