import { useState } from 'react';

interface StaffLoginProps {
  onLogin: (email: string, password: string) => Promise<void>;
  error?: string | null;
  loading?: boolean;
}

export function StaffLogin({ onLogin, error, loading }: StaffLoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-md bg-white shadow rounded-xl p-6 space-y-4">
        <h1 className="text-xl font-semibold">Staff Login</h1>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <input
          className="w-full border rounded p-2"
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          className="w-full border rounded p-2"
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button
          onClick={() => onLogin(email, password)}
          disabled={loading}
          className="w-full bg-blue-600 text-white rounded p-2 disabled:opacity-60"
        >
          {loading ? 'Signing in...' : 'Sign in'}
        </button>
      </div>
    </div>
  );
}
