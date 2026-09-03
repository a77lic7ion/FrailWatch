import { getAuth, createUserWithEmailAndPassword, updateProfile, signInWithEmailAndPassword } from 'firebase/auth';
import { app } from '../firebase';
import { db } from '../firebase';
import { 
  collection, 
  getDocs, 
  getDoc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  doc as firestoreDoc 
} from 'firebase/firestore';

export interface DatabaseStatus {
  status: string;
  firebaseInitialized: boolean;
  firebaseConnected: boolean;
  projectId: string;
  clientEmail: string;
  residentCount: number;
  error?: string | null;
}

export interface AppDataResponse {
  homes: any[];
  residents: any[];
  source: 'firestore' | 'local_fallback';
  timestamp: string;
}

let staffSession: { uid: string; email?: string; role?: string; homeId?: string } | null = null;

export function setStaffSession(s: { uid: string; email?: string; role?: string; homeId?: string } | null) {
  staffSession = s;
}

export async function getAuthHeaders(): Promise<HeadersInit> {
  return {};
}

export const api = {
  async getStatus(): Promise<DatabaseStatus> {
    try {
      return {
        status: 'ok',
        firebaseInitialized: true,
        firebaseConnected: true,
        projectId: 'frailcare-checkin',
        clientEmail: 'firebase-adminsdk@frailcare-checkin.iam.gserviceaccount.com',
        residentCount: 0,
        error: null,
      };
    } catch (e: any) {
      return {
        status: 'error',
        firebaseInitialized: false,
        firebaseConnected: false,
        projectId: 'frailcare-checkin',
        clientEmail: '',
        residentCount: 0,
        error: e?.message || String(e),
      };
    }
  },

  async getData(): Promise<AppDataResponse | null> {
    try {
      const [homesSnap, residentsSnap] = await Promise.all([
        getDocs(collection(db, 'homes')),
        getDocs(collection(db, 'residents')),
      ]);
      const homes = homesSnap.docs.map((d: any) => ({ id: d.id, ...d.data() }));
      const residents = residentsSnap.docs.map((d: any) => ({ id: d.id, ...d.data() }));
      return { homes, residents, source: 'firestore', timestamp: new Date().toISOString() };
    } catch (e) {
      console.warn('API getData fallback triggered:', e);
      return null;
    }
  },

  async recordCheckIn(residentId: string, status: string, checkInTime?: string): Promise<boolean> {
    try {
      await updateDoc(firestoreDoc(db, 'residents', residentId), {
        status,
        checkInTime: checkInTime || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      });
      return true;
    } catch (e) {
      console.warn('Failed to send checkin to backend:', e);
      return false;
    }
  },

  async addResident(resident: any): Promise<{ success: boolean; resident?: any; verificationToken?: string; verificationUrl?: string }> {
    try {
      const token = 'ew_' + Math.random().toString(36).substring(2, 9) + '_' + Date.now().toString(36);
      const data = { ...resident, verificationToken: token, createdAt: new Date().toISOString() };
      const ref = await setDoc(firestoreDoc(collection(db, 'residents')), data);
      return { success: true, resident: { id: ref.id, ...data }, verificationToken: token, verificationUrl: `${window.location.origin}/?verify=${token}&home=${resident.homeId || ''}` };
    } catch (e) {
      console.warn('Failed to add resident to backend:', e);
      return { success: false };
    }
  },

  async getResidentProfile(idOrToken: string): Promise<{ resident?: any; home?: any } | null> {
    try {
      const docSnap = await getDoc(firestoreDoc(db, 'residents', idOrToken));
      if (docSnap.exists()) return { resident: { id: docSnap.id, ...docSnap.data() } };
      const q = query(collection(db, 'residents'), where('verificationToken', '==', idOrToken));
      const snap = await getDocs(q);
      if (!snap.empty) return { resident: { id: (snap.docs[0] as any).id, ...(snap.docs[0] as any).data() } };
      return null;
    } catch (e) {
      console.warn('Error fetching resident profile:', e);
      return null;
    }
  },

  async updateResident(id: string, updates: any): Promise<boolean> {
    try {
      await updateDoc(firestoreDoc(db, 'residents', id), updates);
      return true;
    } catch (e) {
      console.warn('Failed to update resident:', e);
      return false;
    }
  },

  async deleteResident(id: string): Promise<boolean> {
    try {
      await deleteDoc(firestoreDoc(db, 'residents', id));
      return true;
    } catch (e) {
      console.warn('Failed to delete resident:', e);
      return false;
    }
  },

  async updateCutoff(homeId: string, cutoffTime: string): Promise<boolean> {
    try {
      await updateDoc(firestoreDoc(db, 'homes', homeId), { cutoffTime });
      return true;
    } catch (e) {
      console.warn('Failed to update cutoff:', e);
      return false;
    }
  },

  async resetDemo(): Promise<boolean> {
    return true;
  },

  async createHome(payload: { id: string; name: string; location?: string; cutoffTime?: string; careStaffOnDuty?: number; primaryNurse?: string; providerPartner?: string }): Promise<any> {
    try {
      await setDoc(firestoreDoc(db, 'homes', payload.id), payload);
      return { home: payload };
    } catch (e) {
      console.warn('Failed to create home:', e);
      throw e;
    }
  },

  async getHomes(): Promise<any[]> {
    try {
      const snap = await getDocs(collection(db, 'homes'));
      return snap.docs.map((d: any) => ({ id: d.id, ...d.data() }));
    } catch (e) {
      console.warn('Failed to load homes:', e);
      return [];
    }
  },

  async getStaffList(): Promise<any[]> {
    try {
      const snap = await getDocs(collection(db, 'staff'));
      return snap.docs.map((d: any) => ({ uid: d.id, ...d.data() }));
    } catch (e) {
      console.warn('Failed to load staff:', e);
      return [];
    }
  },

  async createStaff(payload: { email: string; password: string; name?: string; role?: string; homeId?: string }): Promise<any> {
    try {
      // If a staff record for this email already exists, reuse it
      const existingStaffQuery = query(collection(db, 'staff'), where('email', '==', payload.email));
      const existingStaffSnap = await getDocs(existingStaffQuery);
      if (!existingStaffSnap.empty) {
        const existing = existingStaffSnap.docs[0];
        const data = existing.data();
        // Ensure the Firebase Auth user exists and matches this staff doc
        try {
          await signInWithEmailAndPassword(getAuth(app), payload.email, payload.password);
        } catch (authErr: any) {
          const code = authErr?.code || '';
          if (code.includes('user-not-found') || code.includes('wrong-password') || code.includes('too-many-requests')) {
            // Auth user missing or password wrong; create it if possible
            try {
              const cred = await createUserWithEmailAndPassword(getAuth(app), payload.email, payload.password);
              await updateProfile(cred.user, { displayName: payload.name || data.name || '' });
              await setDoc(firestoreDoc(db, existing.id), {
                ...data,
                email: payload.email,
                name: payload.name || data.name || '',
                role: payload.role || data.role || 'home_admin',
                homeId: payload.homeId || data.homeId || '',
                uid: cred.user.uid,
              });
              return { uid: cred.user.uid, ...payload };
            } catch (createErr: any) {
              // If email already exists in Auth but not linked to this staff doc, we have an orphan
              if (createErr?.message?.includes('already in use')) {
                throw new Error('This email exists in Firebase Auth but has no staff record. Please contact an admin to clean up Firebase Authentication users.');
              }
              throw createErr;
            }
          }
          throw authErr;
        }
        // Auth user exists and password works; ensure staff doc is up to date
        await setDoc(firestoreDoc(db, existing.id), {
          ...data,
          email: payload.email,
          name: payload.name || data.name || '',
          role: payload.role || data.role || 'home_admin',
          homeId: payload.homeId || data.homeId || '',
        });
        return { uid: existing.id, ...payload };
      }

      // No existing staff doc; create fresh
      try {
        const cred = await createUserWithEmailAndPassword(getAuth(app), payload.email, payload.password);
        await updateProfile(cred.user, { displayName: payload.name || '' });
        await setDoc(firestoreDoc(db, cred.user.uid), {
          email: payload.email,
          name: payload.name || '',
          role: payload.role || 'home_admin',
          homeId: payload.homeId || '',
        });
        return { uid: cred.user.uid, ...payload };
      } catch (createErr: any) {
        const code = createErr?.code || createErr?.message || '';
        if (code.includes('already-in-use') || code.includes('already in use')) {
          throw new Error('Email already in use by Firebase Auth. If the user was deleted, it may take up to 24 hours to release. Try a different email or reset the Firebase Auth user.');
        }
        throw createErr;
      }
    } catch (e: any) {
      console.error('createStaff failed:', e);
      throw new Error(e?.message || 'Failed to create staff');
    }
  },

  async updateStaff(uid: string, updates: any): Promise<boolean> {
    try {
      await updateDoc(firestoreDoc(db, 'staff', uid), updates);
      return true;
    } catch (e) {
      console.warn('Failed to update staff:', e);
      return false;
    }
  },

  async deleteStaff(uid: string): Promise<boolean> {
    try {
      await deleteDoc(firestoreDoc(db, 'staff', uid));
      return true;
    } catch (e) {
      console.warn('Failed to delete staff:', e);
      return false;
    }
  },
};
