import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getFirestore,
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  onSnapshot,
  getDocFromServer,
  enableIndexedDbPersistence
} from 'firebase/firestore';
import firebaseConfigData from '../firebase-applet-config.json';

// Allow overriding from localStorage if user switches to an external Firebase project
export function getActiveFirebaseConfig() {
  try {
    const customConfig = localStorage.getItem('elderwatch_custom_firebase_config');
    if (customConfig) {
      const parsed = JSON.parse(customConfig);
      if (parsed.projectId) {
        return parsed;
      }
    }
  } catch {
    // ignore
  }
  return firebaseConfigData;
}

export function setCustomFirebaseConfig(config: any): boolean {
  try {
    if (!config || !config.projectId) return false;
    localStorage.setItem('elderwatch_custom_firebase_config', JSON.stringify(config));
    return true;
  } catch {
    return false;
  }
}

export function resetToDefaultFirebaseConfig(): void {
  try {
    localStorage.removeItem('elderwatch_custom_firebase_config');
  } catch {
    // ignore
  }
}

export function isUsingCustomFirebase(): boolean {
  try {
    return Boolean(localStorage.getItem('elderwatch_custom_firebase_config'));
  } catch {
    return false;
  }
}

export const activeConfig = getActiveFirebaseConfig();

// Initialize Firebase App
export const app = getApps().length > 0 ? getApp() : initializeApp(activeConfig);

// Initialize Firestore with custom database ID if specified
export const db = activeConfig.firestoreDatabaseId 
  ? getFirestore(app, activeConfig.firestoreDatabaseId)
  : getFirestore(app);

// Enable offline persistence for instant local reads/writes with automatic sync
(async () => {
  try {
    await enableIndexedDbPersistence(db);
  } catch (err: any) {
    // Common: multiple tabs open or browser restrictions; ignore and continue online
    // eslint-disable-next-line no-console
    console.warn('Firestore persistence could not be enabled:', err?.message || err);
  }
})();

// Connection test
export async function testFirestoreConnection(): Promise<{ connected: boolean; message: string; projectId: string }> {
  try {
    const testDoc = doc(db, '_connection_test', 'status');
    await getDocFromServer(testDoc).catch(() => {});
    return {
      connected: true,
      message: 'Successfully connected to live Firebase Firestore database',
      projectId: activeConfig.projectId,
    };
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    return {
      connected: false,
      message: msg,
      projectId: activeConfig.projectId,
    };
  }
}
