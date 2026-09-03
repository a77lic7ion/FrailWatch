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
    console.log('[staffAuth] Attempting signInWithEmailAndPassword for', email);
    const cred = await signInWithEmailAndPassword(auth, email, password);
    console.log('[staffAuth] Auth success for', email, 'uid=', cred.user.uid);
    return cred.user;
  } catch (err: any) {
    const code = err?.code || '';
    console.warn('[staffAuth] Auth failed for', email, 'code=', code, 'message=', err?.message);
    if (code.includes('user-not-found') || code.includes('wrong-password')) {
      console.log('[staffAuth] Checking staff doc fallback for', email);
      const q = query(collection(db, 'staff'), where('email', '==', email));
      const snap = await getDocs(q);
      console.log('[staffAuth] Staff query result for', email, 'empty=', snap.empty, 'count=', snap.docs.length);
      if (!snap.empty) {
        const staffData = snap.docs[0].data() as any;
        console.log('[staffAuth] Creating Firebase Auth user for existing staff', email);
        const cred = await createUserWithEmailAndPassword(auth, email, password);
        if (staffData.name) {
          await updateProfile(cred.user, { displayName: staffData.name });
        }
        const merged = { ...staffData, uid: cred.user.uid };
        await setDoc(doc(db, 'staff', cred.user.uid), merged);
        console.log('[staffAuth] Created Firebase Auth user and migrated staff doc', cred.user.uid);
        return cred.user;
      }
    }
    throw err;
  }
}

async function setStaffSessionFromUser(user: User): Promise<StaffRecord> {
  console.log('[staffAuth] Looking up staff doc for uid', user.uid);
  const staffDoc = await getDoc(doc(db, 'staff', user.uid));
  if (!staffDoc.exists()) {
    console.warn('[staffAuth] No staff doc found for uid', user.uid);
    throw new Error('No staff record found');
  }
  const data = staffDoc.data() as any;
  console.log('[staffAuth] Staff doc found', data);
  return {
    uid: user.uid,
    email: data.email || user.email || '',
    name: data.name || '',
    role: data.role || 'home_admin',
    homeId: data.homeId || '',
  };
}

export async function staffLogin(email: string, password: string): Promise<StaffRecord> {
  console.log('[staffAuth] staffLogin start', email);
  try {
    const user = await ensureFirebaseUser(email, password);
    const staff = await setStaffSessionFromUser(user);
    console.log('[staffAuth] staffLogin success', staff);
    return staff;
  } catch (err: any) {
    console.error('[staffAuth] staffLogin failed', err);
    throw err;
  }
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

let loggingOut = false;
export function markLoggingOut() {
  loggingOut = true;
}

export function onStaffAuthChange(callback: (staff: StaffRecord | null) => void) {
  return onAuthStateChanged(auth, async (u: User | null) => {
    if (!u) {
      callback(null);
      return;
    }
    if (loggingOut) {
      callback(null);
      loggingOut = false;
      return;
    }
    try {
      const staff = await getStaffMe();
      callback(staff);
    } catch {
      callback(null);
    }
  });
}

