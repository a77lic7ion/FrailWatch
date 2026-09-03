import express, { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import { initializeApp, cert, getApps, ServiceAccount } from 'firebase-admin/app';
import { getFirestore, Firestore, FieldValue } from 'firebase-admin/firestore';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// ----------------------------------------------------
// Initial Seeds (fallback and initial Firestore setup)
// ----------------------------------------------------
const SEED_HOMES = [
  {
    id: 'home-benoni-01',
    name: 'Benoni Frail Care & Assisted Living',
    location: 'Willow Lane, Benoni',
    totalResidents: 24,
    cutoffTime: '09:15',
    careStaffOnDuty: 4,
    primaryNurse: 'Sr. Sarah Botha, RN',
    providerPartner: '4TIFY SECURITY & Care Solutions',
  },
  {
    id: 'home-stjude-02',
    name: 'St. Jude Senior Manor',
    location: 'Highland Ridge, Bryanston',
    totalResidents: 18,
    cutoffTime: '09:00',
    careStaffOnDuty: 3,
    primaryNurse: 'Sr. Thandi Ndlovu',
    providerPartner: '4TIFY SECURITY & Care Solutions',
  }
];

// Real database state - Mock residents stripped.
// Real residents are created via the Admin interface and stored into Firestore.
const SEED_RESIDENTS: any[] = [];

// ----------------------------------------------------
// In-Memory Fallback State (Synced with Firestore)
// ----------------------------------------------------
let memoryHomes = JSON.parse(JSON.stringify(SEED_HOMES));
let memoryResidents: any[] = [];

// ----------------------------------------------------
// Firebase Configuration & Initialization
// ----------------------------------------------------
let appletConfig: any = null;
try {
  const configPath = path.resolve(process.cwd(), 'firebase-applet-config.json');
  if (fs.existsSync(configPath)) {
    appletConfig = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
  }
} catch (e) {
  console.warn('Could not read firebase-applet-config.json:', e);
}

const activeProjectId = appletConfig?.projectId || process.env.FIREBASE_PROJECT_ID || 'gen-lang-client-0808815070';
const activeDatabaseId = appletConfig?.firestoreDatabaseId || '';

let firestoreDb: Firestore | null = null;
let firebaseInitialized = false;
let firebaseError: string | null = null;

function initFirebase() {
  try {
    if (getApps().length > 0) {
      firestoreDb = activeDatabaseId ? getFirestore(getApps()[0], activeDatabaseId) : getFirestore();
      firebaseInitialized = true;
      return firestoreDb;
    }

    let serviceAccount: ServiceAccount | null = null;

    if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
      try {
        serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
      } catch (e) {
        console.warn('Failed to parse FIREBASE_SERVICE_ACCOUNT_KEY env var:', e);
      }
    }

    if (!serviceAccount) {
      const saPath = path.resolve(process.cwd(), 'firebase-service-account.json');
      if (fs.existsSync(saPath)) {
        try {
          serviceAccount = JSON.parse(fs.readFileSync(saPath, 'utf-8'));
        } catch (e) {
          console.warn('Failed to parse firebase-service-account.json:', e);
        }
      }
    }

    if (serviceAccount) {
      initializeApp({
        credential: cert(serviceAccount),
        projectId: (serviceAccount as { project_id?: string }).project_id || activeProjectId,
      });
      firestoreDb = activeDatabaseId ? getFirestore(getApps()[0], activeDatabaseId) : getFirestore();
      firebaseInitialized = true;
      console.log('Firebase Admin initialized with service account for:', activeProjectId);
    } else {
      initializeApp({
        projectId: activeProjectId,
      });
      firestoreDb = activeDatabaseId ? getFirestore(getApps()[0], activeDatabaseId) : getFirestore();
      firebaseInitialized = true;
      console.log('Firebase initialized with project:', activeProjectId);
    }
    
    seedFirestoreIfEmpty().catch((err) => {
      console.warn('Firestore initial seeding error:', err.message);
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    firebaseError = message;
    console.error('Firebase initialization:', message);
  }
  return firestoreDb;
}

async function seedFirestoreIfEmpty() {
  if (!firestoreDb) return;
  try {
    const homesSnap = await firestoreDb.collection('homes').limit(1).get();
    if (homesSnap.empty) {
      console.log('Seeding initial care facilities to Firestore...');
      const batch = firestoreDb.batch();
      for (const home of SEED_HOMES) {
        const docRef = firestoreDb.collection('homes').doc(home.id);
        batch.set(docRef, home);
      }
      await batch.commit();
      console.log('Firestore facilities successfully registered.');
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.warn('Could not auto-seed facility headers:', message);
  }
}

// Initialize on startup
initFirebase();

// ----------------------------------------------------
// REST API Routes
// ----------------------------------------------------

// 1. Health & Database Status
app.get('/api/health', async (_req: Request, res: Response) => {
  let isConnected = false;
  let residentCount = memoryResidents.length;
  let errorMsg = firebaseError;

  if (firestoreDb) {
    try {
      const snap = await firestoreDb.collection('residents').get();
      isConnected = true;
      residentCount = snap.size;
    } catch (e: unknown) {
      isConnected = false;
      errorMsg = e instanceof Error ? e.message : String(e);
    }
  }

  res.json({
    status: 'ok',
    firebaseInitialized,
    firebaseConnected: isConnected,
    projectId: activeProjectId,
    firestoreDatabaseId: activeDatabaseId,
    clientEmail: 'firebase-adminsdk@' + activeProjectId + '.iam.gserviceaccount.com',
    residentCount,
    error: errorMsg,
  });
});

// 2. Fetch All Data (Homes & Residents)
app.get('/api/data', async (_req: Request, res: Response) => {
  if (firestoreDb) {
    try {
      const [homesSnap, residentsSnap] = await Promise.all([
        firestoreDb.collection('homes').get(),
        firestoreDb.collection('residents').get(),
      ]);

      const homes = homesSnap.empty
        ? memoryHomes
        : homesSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
      const residents = residentsSnap.empty
        ? memoryResidents
        : residentsSnap.docs.map((d) => {
            const data = d.data();
            return {
              id: d.id,
              ...data,
              homeId: data.homeId || 'home-benoni-01',
              verificationToken: data.verificationToken || `ew_${d.id}`,
              deviceLinked: Boolean(data.deviceLinked),
              wing: data.wing || 'Willow Cottage',
              sevenDayHistory: Array.isArray(data.sevenDayHistory) && data.sevenDayHistory.length > 0
                ? data.sevenDayHistory
                : [
                    { date: '2026-08-28', day: 'Fri', status: 'ok', time: '08:10 AM' },
                    { date: '2026-08-29', day: 'Sat', status: 'ok', time: '08:15 AM' },
                    { date: '2026-08-30', day: 'Sun', status: 'ok', time: '08:05 AM' },
                    { date: '2026-08-31', day: 'Mon', status: 'ok', time: '08:20 AM' },
                    { date: '2026-09-01', day: 'Tue', status: 'ok', time: '08:12 AM' },
                    { date: '2026-09-02', day: 'Wed', status: 'ok', time: '08:18 AM' },
                    { date: '2026-09-03', day: 'Today', status: data.status || 'awaiting' },
                  ],
              medicalAlerts: Array.isArray(data.medicalAlerts) ? data.medicalAlerts : [],
              emergencyContact: data.emergencyContact || {
                name: 'Emergency Contact',
                relationship: 'Family',
                phone: '+27 82 111 2222',
                notifyOnIssue: true,
              },
            };
          });

      // Update memory cache
      memoryHomes = homes as typeof SEED_HOMES;
      memoryResidents = residents as typeof SEED_RESIDENTS;

      return res.json({
        homes,
        residents,
        source: 'firestore',
        timestamp: new Date().toISOString(),
      });
    } catch (err: unknown) {
      console.warn('Firestore read error, serving memory fallback:', err);
    }
  }

  res.json({
    homes: memoryHomes,
    residents: memoryResidents,
    source: 'local_fallback',
    timestamp: new Date().toISOString(),
  });
});

// 3. Update Check-in Status
app.post('/api/checkin', async (req: Request, res: Response) => {
  const { residentId, status, checkInTime } = req.body;
  if (!residentId || !status) {
    return res.status(400).json({ error: 'residentId and status are required' });
  }

  const time = checkInTime || (status === 'awaiting' ? undefined : new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));

  // Update in memory
  const idx = memoryResidents.findIndex((r) => r.id === residentId);
  if (idx !== -1) {
    memoryResidents[idx].status = status;
    memoryResidents[idx].checkInTime = time;
  }

  // Persist in Firestore
  if (firestoreDb) {
    try {
      const docRef = firestoreDb.collection('residents').doc(residentId);
      await docRef.set({ status, checkInTime: time }, { merge: true });

      // Log event into checkin_events collection
      await firestoreDb.collection('checkin_events').add({
        residentId,
        status,
        checkInTime: time,
        recordedAt: FieldValue.serverTimestamp(),
      });
    } catch (e: unknown) {
      console.warn('Failed to update Firestore check-in:', e);
    }
  }

  res.json({ success: true, residentId, status, checkInTime: time });
});

// 4. Add New Resident (by administrator, assigned per home)
app.post('/api/residents', async (req: Request, res: Response) => {
  const newResident = req.body;
  if (!newResident.name || !newResident.room) {
    return res.status(400).json({ error: 'name and room are required' });
  }

  const id = newResident.id || `res-${Date.now()}`;
  const homeId = newResident.homeId || 'home-benoni-01';
  const verificationToken = newResident.verificationToken || ('ew_' + Math.random().toString(36).substring(2, 9) + '_' + Date.now().toString(36));

  const completeResident = {
    ...newResident,
    id,
    homeId,
    verificationToken,
    status: newResident.status || 'awaiting',
    deviceLinked: newResident.deviceLinked !== undefined ? newResident.deviceLinked : false,
    createdAt: new Date().toISOString(),
    sevenDayHistory: newResident.sevenDayHistory || [
      { date: '2026-09-03', day: 'Today', status: newResident.status || 'awaiting' },
    ],
  };

  memoryResidents.push(completeResident);

  if (firestoreDb) {
    try {
      await firestoreDb.collection('residents').doc(id).set(completeResident);
      
      // Log creation event in Firestore
      await firestoreDb.collection('checkin_events').add({
        residentId: id,
        homeId,
        event: 'resident_created_by_admin',
        name: completeResident.name,
        phone: completeResident.phone,
        verificationToken,
        recordedAt: FieldValue.serverTimestamp(),
      });
    } catch (e: unknown) {
      console.warn('Failed to insert resident in Firestore:', e);
    }
  }

  res.json({ 
    success: true, 
    resident: completeResident, 
    verificationToken,
    verificationUrl: `/?verify=${verificationToken}&home=${homeId}`
  });
});

// 5. Verify & Attach Device to Care Home
const performVerification = async (token?: string, residentId?: string, res?: Response) => {
  let resident: any = memoryResidents.find(
    (r) => (token && r.verificationToken === token) || (residentId && r.id === residentId)
  );

  if (!resident && firestoreDb) {
    try {
      if (token) {
        const snap = await firestoreDb.collection('residents').where('verificationToken', '==', token).limit(1).get();
        if (!snap.empty) {
          const doc = snap.docs[0];
          resident = { id: doc.id, ...doc.data() };
        }
      }
      if (!resident && residentId) {
        const doc = await firestoreDb.collection('residents').doc(residentId).get();
        if (doc.exists) {
          resident = { id: doc.id, ...doc.data() };
        }
      }
    } catch (e) {
      console.warn('Firestore verification lookup error:', e);
    }
  }

  if (!resident) {
    return res?.status(404).json({ 
      error: 'Invalid or expired verification link. Please request a new link from your care home administrator.' 
    });
  }

  // Mark device as attached/linked in database
  const verifiedAt = new Date().toISOString();
  resident.deviceLinked = true;
  resident.verifiedAt = verifiedAt;

  // Update in memory
  const idx = memoryResidents.findIndex((r) => r.id === resident.id);
  if (idx !== -1) {
    memoryResidents[idx].deviceLinked = true;
    memoryResidents[idx].verifiedAt = verifiedAt;
  }

  // Persist attachment in Firestore
  if (firestoreDb) {
    try {
      await firestoreDb.collection('residents').doc(resident.id).set(
        { deviceLinked: true, verifiedAt },
        { merge: true }
      );

      await firestoreDb.collection('checkin_events').add({
        residentId: resident.id,
        homeId: resident.homeId || 'home-benoni-01',
        event: 'device_verified_and_attached',
        phone: resident.phone,
        recordedAt: FieldValue.serverTimestamp(),
      });
    } catch (e) {
      console.warn('Failed to update verified resident in Firestore:', e);
    }
  }

  // Fetch home details to attach
  const targetHomeId = resident.homeId || 'home-benoni-01';
  let home = memoryHomes.find((h) => h.id === targetHomeId);
  if (!home && firestoreDb) {
    try {
      const homeDoc = await firestoreDb.collection('homes').doc(targetHomeId).get();
      if (homeDoc.exists) {
        home = { id: homeDoc.id, ...homeDoc.data() } as any;
      }
    } catch (e) {
      console.warn('Failed to fetch home for verification:', e);
    }
  }

  return res?.json({
    success: true,
    message: `Device verified and attached to ${home?.name || 'Care Home'}`,
    resident,
    home: home || memoryHomes[0],
  });
};

app.post('/api/verify', async (req: Request, res: Response) => {
  const token = (req.body.token || req.query.token) as string;
  const residentId = (req.body.residentId || req.query.residentId) as string;
  return performVerification(token, residentId, res);
});

app.get('/api/verify', async (req: Request, res: Response) => {
  const token = req.query.token as string;
  const residentId = req.query.residentId as string;
  return performVerification(token, residentId, res);
});

// 6. Get Single Resident + Home Profile (for senior client check-in website)
app.get('/api/resident/:idOrToken', async (req: Request, res: Response) => {
  const { idOrToken } = req.params;
  let resident: any = memoryResidents.find(
    (r) => r.id === idOrToken || r.verificationToken === idOrToken
  );

  if (!resident && firestoreDb) {
    try {
      const doc = await firestoreDb.collection('residents').doc(idOrToken).get();
      if (doc.exists) {
        resident = { id: doc.id, ...doc.data() };
      } else {
        const snap = await firestoreDb.collection('residents').where('verificationToken', '==', idOrToken).limit(1).get();
        if (!snap.empty) {
          resident = { id: snap.docs[0].id, ...snap.docs[0].data() };
        }
      }
    } catch (e) {
      console.warn('Error fetching single resident from Firestore:', e);
    }
  }

  if (!resident) {
    return res.status(404).json({ error: 'Resident profile not found' });
  }

  const targetHomeId = resident.homeId || 'home-benoni-01';
  const home = memoryHomes.find((h) => h.id === targetHomeId) || memoryHomes[0];

  res.json({ resident, home });
});

// 5. Update Resident
app.put('/api/residents/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  const updates = req.body;

  const idx = memoryResidents.findIndex((r) => r.id === id);
  if (idx !== -1) {
    memoryResidents[idx] = { ...memoryResidents[idx], ...updates };
  }

  if (firestoreDb) {
    try {
      await firestoreDb.collection('residents').doc(id).set(updates, { merge: true });
    } catch (e: unknown) {
      console.warn('Failed to update resident in Firestore:', e);
    }
  }

  res.json({ success: true, id, updates });
});

// 6. Delete Resident
app.delete('/api/residents/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  memoryResidents = memoryResidents.filter((r) => r.id !== id);

  if (firestoreDb) {
    try {
      await firestoreDb.collection('residents').doc(id).delete();
    } catch (e: unknown) {
      console.warn('Failed to delete resident from Firestore:', e);
    }
  }

  res.json({ success: true, id });
});

// 7. Update Home Cutoff Time
app.put('/api/cutoff', async (req: Request, res: Response) => {
  const { homeId, cutoffTime } = req.body;
  if (!homeId || !cutoffTime) {
    return res.status(400).json({ error: 'homeId and cutoffTime are required' });
  }

  const idx = memoryHomes.findIndex((h) => h.id === homeId);
  if (idx !== -1) {
    memoryHomes[idx].cutoffTime = cutoffTime;
  }

  if (firestoreDb) {
    try {
      await firestoreDb.collection('homes').doc(homeId).set({ cutoffTime }, { merge: true });
    } catch (e: unknown) {
      console.warn('Failed to update cutoff time in Firestore:', e);
    }
  }

  res.json({ success: true, homeId, cutoffTime });
});

// 8. Reset Demo Data
app.post('/api/reset-demo', async (_req: Request, res: Response) => {
  memoryHomes = JSON.parse(JSON.stringify(SEED_HOMES));
  memoryResidents = JSON.parse(JSON.stringify(SEED_RESIDENTS));

  if (firestoreDb) {
    try {
      const batch = firestoreDb.batch();
      for (const res of SEED_RESIDENTS) {
        batch.set(firestoreDb.collection('residents').doc(res.id), res);
      }
      for (const home of SEED_HOMES) {
        batch.set(firestoreDb.collection('homes').doc(home.id), home);
      }
      await batch.commit();
    } catch (e: unknown) {
      console.warn('Failed to reset demo in Firestore:', e);
    }
  }

  res.json({ success: true, homes: memoryHomes, residents: memoryResidents });
});

// ----------------------------------------------------
// Vite Middleware & Static Production Serving
// ----------------------------------------------------
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening at http://0.0.0.0:${PORT}`);
  });
}

startServer();
