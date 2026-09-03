import React from 'react';
import { Logo } from './Logo';

export function SplashScreen({ onContinue }: { onContinue: () => void }) {
  return (
    <div className="fixed inset-0 z-40 bg-white flex flex-col items-center justify-between py-12 px-6">
      <div className="text-center">
        <Logo className="w-16 h-16 mx-auto mb-4" />
        <h1 className="text-2xl font-black text-slate-900">ElderWatch</h1>
        <p className="text-sm text-slate-500 mt-2">Morning reassurance check-in for residents and care teams.</p>
      </div>
      <button
        onClick={onContinue}
        className="w-full max-w-sm rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold py-4 transition"
      >
        Continue to Login
      </button>
    </div>
  );
}
