import { getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth';
import { app } from '../firebase';

const auth = getAuth(app);

export async function staffLogin(email: string, password: string) {
  const cred = await signInWithEmailAndPassword(auth, email, password);
  const idToken = await cred.user.getIdToken();
  const res = await fetch('/api/staff-login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${idToken}` },
    body: JSON.stringify({ email }),
  });
  if (!res.ok) throw new Error('Staff login failed');
  return res.json();
}

export async function staffLogout() {
  await signOut(auth);
}

export function onStaffAuthChange(callback: (staff: any | null) => void) {
  return onAuthStateChanged(auth, async (u) => {
    if (!u) return callback(null);
    try {
      const idToken = await u.getIdToken();
      const res = await fetch('/api/staff-me', {
        headers: { Authorization: `Bearer ${idToken}` },
      });
      if (!res.ok) return callback(null);
      const data = await res.json();
      callback(data.staff || null);
    } catch {
      callback(null);
    }
  });
}
