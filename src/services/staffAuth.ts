import { getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged, User, createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { app } from '../firebase';
import { doc, getDoc, setDoc, collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../firebase';

const auth = getAuth(app);

export interface StaffRecord {
  uid: string;
  email: string;
  name?: string;
  role?: string;
  homeId?: string;
}

async function ensureFirebaseUser(email: string, password: string): Promise<User> {
  try {
    const cred = await signInWithEmailAndPassword(auth, email, password);
    return cred.user;
  } catch (err: any) {
    const code = err?.code || '';
    if (code.includes('user-not-found') || code.includes('wrong-password')) {
      const q = query(collection(db, 'staff'), where('email', '==', email));
      const snap = await getDocs(q);
      if (!snap.empty) {
        const staffData = snap.docs[0].data() as any;
        const cred = await createUserWithEmailAndPassword(auth, email, password);
        if (staffData.name) {
          await updateProfile(cred.user, { displayName: staffData.name });
        }
        const merged = { ...staffData, uid: cred.user.uid };
        await setDoc(doc(db, 'staff', cred.user.uid), merged);
        return cred.user;
      }
    }
    throw err;
  }
}

async function setStaffSessionFromUser(user: User): Promise<StaffRecord> {
  const staffDoc = await getDoc(doc(db, 'staff', user.uid));
  if (!staffDoc.exists()) {
    throw new Error('No staff record found');
  }
  const data = staffDoc.data() as any;
  return {
    uid: user.uid,
    email: data.email || user.email || '',
    name: data.name || '',
    role: data.role || 'home_admin',
    homeId: data.homeId || '',
  };
}

export async function staffLogin(email: string, password: string): Promise<StaffRecord> {
  const user = await ensureFirebaseUser(email, password);
  const staff = await setStaffSessionFromUser(user);
  return staff;
}

export async function staffLogout(): Promise<void> {
  await signOut(auth);
}

export async function getStaffMe(): Promise<StaffRecord | null> {
  const user = auth.currentUser;
  if (!user) return null;
  try {
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
  } catch {
    return null;
  }
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
