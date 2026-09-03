import { getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged, User } from 'firebase/auth';
import { app } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';

const auth = getAuth(app);

export interface StaffRecord {
  uid: string;
  email: string;
  name?: string;
  role?: string;
  homeId?: string;
}

export async function staffLogin(email: string, password: string): Promise<StaffRecord> {
  const cred = await signInWithEmailAndPassword(auth, email, password);
  const uid = cred.user.uid;
  const staffDoc = await getDoc(doc(db, 'staff', uid));
  if (!staffDoc.exists()) {
    throw new Error('No staff record found');
  }
  const data = staffDoc.data() as any;
  return {
    uid,
    email: data.email || email,
    name: data.name || '',
    role: data.role || 'home_admin',
    homeId: data.homeId || '',
  };
}

export async function staffLogout(): Promise<void> {
  await signOut(auth);
}

export async function getStaffMe(): Promise<StaffRecord | null> {
  const user = auth.currentUser;
  if (!user) return null;
  const staffDoc = await getDoc(doc(db, 'staff', user.uid));
  if (!staffDoc.exists()) return null;
  const data = staffDoc.data() as any;
  return {
    uid: user.uid,
    email: data.email || user.email || '',
    name: data.name || '',
    role: data.role || 'home_admin',
    homeId: data.homeId || '',
  };
}

export function onStaffAuthChange(callback: (staff: StaffRecord | null) => void) {
  return onAuthStateChanged(auth, async (u: User | null) => {
    if (!u) return callback(null);
    try {
      const staff = await getStaffMe();
      callback(staff);
    } catch {
      callback(null);
    }
  });
}
