import { getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth';
import { app } from '../firebase';

const auth = getAuth(app);

export async function staffLogin(email: string, password: string) {
  try {
    const cred = await signInWithEmailAndPassword(auth, email, password);
    const idToken = await cred.user.getIdToken();
    const res = await fetch('/api/staff-login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${idToken}` },
      body: JSON.stringify({ email }),
    });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(text || 'Staff login failed');
    }
    return res.json();
  } catch (err: any) {
    console.error('staffLogin error', err);
    const code = err?.code || '';
    const message = err?.message || String(err);
    const reason = code ? `${code}: ${message}` : message;
    throw new Error(reason || 'Staff login failed');
  }
}

export async function staffLogout() {
  try { await signOut(auth); } catch {}
}

export async function getStaffMe() {
  const user = auth.currentUser;
  if (!user) return null;
  const idToken = await user.getIdToken();
  const res = await fetch('/api/staff-me', {
    headers: { Authorization: `Bearer ${idToken}` },
  });
  if (!res.ok) return null;
  return res.json();
}

export function onStaffAuthChange(callback: (staff: any | null) => void) {
  return onAuthStateChanged(auth, async (u) => {
    if (!u) return callback(null);
    try {
      const data = await getStaffMe();
      callback(data?.staff || null);
    } catch (err) {
      console.error('onStaffAuthChange error', err);
      callback(null);
    }
  });
}
