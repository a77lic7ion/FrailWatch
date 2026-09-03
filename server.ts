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

const SEED_RESIDENTS = [
  {
    id: 'res-1',
    name: 'Margaret Thompson',
    room: 'Room 14',
    wing: 'Willow Cottage',
    phone: '+27 82 555 1201',
    deviceLinked: true,
    status: 'ok',
    checkInTime: '08:14 AM',
    notes: 'Mild arthritis in fingers. Prefers large touch targets.',
    medicalAlerts: ['Hypertension', 'Hearing aid right ear'],
    caregiver: 'Sr. Sarah Botha',
    emergencyContact: {
      name: 'Claire Thompson',
      relationship: 'Daughter',
      phone: '+27 83 444 8921',
      notifyOnIssue: true,
    },
    sevenDayHistory: [
      { date: '2026-08-28', day: 'Wed', status: 'ok', time: '08:05 AM' },
      { date: '2026-08-29', day: 'Thu', status: 'ok', time: '08:11 AM' },
      { date: '2026-08-30', day: 'Fri', status: 'ok', time: '08:22 AM' },
      { date: '2026-08-31', day: 'Sat', status: 'ok', time: '08:09 AM' },
      { date: '2026-09-01', day: 'Sun', status: 'ok', time: '08:18 AM' },
      { date: '2026-09-02', day: 'Mon', status: 'ok', time: '08:04 AM' },
      { date: '2026-09-03', day: 'Today', status: 'ok', time: '08:14 AM' },
    ]
  },
  {
    id: 'res-2',
    name: 'Arthur Pendelton',
    room: 'Room 07',
    wing: 'Rose Wing',
    phone: '+27 82 555 3392',
    deviceLinked: true,
    status: 'not_ok',
    checkInTime: '08:31 AM',
    notes: 'Tapped "I NEED HELP" button. Reported dizziness getting out of bed.',
    medicalAlerts: ['Post-hip replacement', 'Fall risk'],
    caregiver: 'Nurse David M.',
    emergencyContact: {
      name: 'David Pendelton',
      relationship: 'Son',
      phone: '+27 82 999 1144',
      notifyOnIssue: true,
    },
    sevenDayHistory: [
      { date: '2026-08-28', day: 'Wed', status: 'ok', time: '07:55 AM' },
      { date: '2026-08-29', day: 'Thu', status: 'ok', time: '08:02 AM' },
      { date: '2026-08-30', day: 'Fri', status: 'ok', time: '07:48 AM' },
      { date: '2026-08-31', day: 'Sat', status: 'ok', time: '08:15 AM' },
      { date: '2026-09-01', day: 'Sun', status: 'ok', time: '08:00 AM' },
      { date: '2026-09-02', day: 'Mon', status: 'ok', time: '07:58 AM' },
      { date: '2026-09-03', day: 'Today', status: 'not_ok', time: '08:31 AM' },
    ]
  },
  {
    id: 'res-3',
    name: 'Evelyn Vance',
    room: 'Room 22',
    wing: 'Garden Suites',
    phone: '+27 83 712 9043',
    deviceLinked: true,
    status: 'overdue',
    notes: 'Cutoff passed with zero response. Requires immediate physical window check.',
    medicalAlerts: ['Diabetic (requires 08:30 insulin)', 'Deep sleeper'],
    caregiver: 'Sr. Sarah Botha',
    emergencyContact: {
      name: 'Marcus Vance',
      relationship: 'Son',
      phone: '+27 84 321 0099',
      notifyOnIssue: true,
    },
    sevenDayHistory: [
      { date: '2026-08-28', day: 'Wed', status: 'ok', time: '08:45 AM' },
      { date: '2026-08-29', day: 'Thu', status: 'ok', time: '08:50 AM' },
      { date: '2026-08-30', day: 'Fri', status: 'ok', time: '08:40 AM' },
      { date: '2026-08-31', day: 'Sat', status: 'ok', time: '08:52 AM' },
      { date: '2026-09-01', day: 'Sun', status: 'ok', time: '08:48 AM' },
      { date: '2026-09-02', day: 'Mon', status: 'ok', time: '08:55 AM' },
      { date: '2026-09-03', day: 'Today', status: 'overdue', time: undefined },
    ]
  },
  {
    id: 'res-4',
    name: 'Robert "Bob" Davies',
    room: 'Room 03',
    wing: 'Willow Cottage',
    phone: '+27 82 331 4455',
    deviceLinked: true,
    status: 'awaiting',
    notes: 'Usually checks in around 08:50 AM after his morning coffee.',
    medicalAlerts: ['Mild cognitive impairment'],
    caregiver: 'Nurse Grace K.',
    emergencyContact: {
      name: 'Helen Davies',
      relationship: 'Spouse',
      phone: '+27 82 331 4456',
      notifyOnIssue: false,
    },
    sevenDayHistory: [
      { date: '2026-08-28', day: 'Wed', status: 'ok', time: '08:49 AM' },
      { date: '2026-08-29', day: 'Thu', status: 'ok', time: '08:52 AM' },
      { date: '2026-08-30', day: 'Fri', status: 'ok', time: '08:47 AM' },
      { date: '2026-08-31', day: 'Sat', status: 'ok', time: '08:55 AM' },
      { date: '2026-09-01', day: 'Sun', status: 'ok', time: '08:50 AM' },
      { date: '2026-09-02', day: 'Mon', status: 'ok', time: '08:48 AM' },
      { date: '2026-09-03', day: 'Today', status: 'awaiting', time: undefined },
    ]
  },
  {
    id: 'res-5',
    name: 'Constance "Connie" Meyer',
    room: 'Room 19',
    wing: 'Garden Suites',
    phone: '+27 79 123 7890',
    deviceLinked: true,
    status: 'ok',
    checkInTime: '07:28 AM',
    notes: 'Early riser, checks in as soon as she wakes up.',
    medicalAlerts: ['Cardiac pacemaker'],
    caregiver: 'Sr. Sarah Botha',
    emergencyContact: {
      name: 'Simon Meyer',
      relationship: 'Grandson',
      phone: '+27 71 888 2211',
      notifyOnIssue: true,
    },
    sevenDayHistory: [
      { date: '2026-08-28', day: 'Wed', status: 'ok', time: '07:30 AM' },
      { date: '2026-08-29', day: 'Thu', status: 'ok', time: '07:25 AM' },
      { date: '2026-08-30', day: 'Fri', status: 'ok', time: '07:32 AM' },
      { date: '2026-08-31', day: 'Sat', status: 'ok', time: '07:22 AM' },
      { date: '2026-09-01', day: 'Sun', status: 'ok', time: '07:40 AM' },
      { date: '2026-09-02', day: 'Mon', status: 'ok', time: '07:35 AM' },
      { date: '2026-09-03', day: 'Today', status: 'ok', time: '07:28 AM' },
    ]
  },
  {
    id: 'res-6',
    name: 'George Van Der Merwe',
    room: 'Room 11',
    wing: 'Rose Wing',
    phone: '+27 82 443 6677',
    deviceLinked: true,
    status: 'ok',
    checkInTime: '08:01 AM',
    notes: 'Uses tablet on bedside stand.',
    medicalAlerts: ['Parkinsons (mild tremor)'],
    caregiver: 'Nurse David M.',
    emergencyContact: {
      name: 'Annamarie Van Der Merwe',
      relationship: 'Daughter',
      phone: '+27 83 222 9900',
      notifyOnIssue: true,
    },
    sevenDayHistory: [
      { date: '2026-08-28', day: 'Wed', status: 'ok', time: '08:10 AM' },
      { date: '2026-08-29', day: 'Thu', status: 'ok', time: '08:08 AM' },
      { date: '2026-08-30', day: 'Fri', status: 'ok', time: '08:05 AM' },
      { date: '2026-08-31', day: 'Sat', status: 'ok', time: '08:12 AM' },
      { date: '2026-09-01', day: 'Sun', status: 'ok', time: '08:15 AM' },
      { date: '2026-09-02', day: 'Mon', status: 'ok', time: '08:03 AM' },
      { date: '2026-09-03', day: 'Today', status: 'ok', time: '08:01 AM' },
    ]
  },
  {
    id: 'res-7',
    name: 'Dorothy Zimmerman',
    room: 'Room 28',
    wing: 'Garden Suites',
    phone: '+27 84 901 2345',
    deviceLinked: true,
    status: 'awaiting',
    notes: 'Recent move-in. Family visits Tuesdays & Thursdays.',
    medicalAlerts: ['Macular degeneration (low vision)'],
    caregiver: 'Sr. Sarah Botha',
    emergencyContact: {
      name: 'Jonathan Zimmerman',
      relationship: 'Son',
      phone: '+27 82 505 1122',
      notifyOnIssue: true,
    },
    sevenDayHistory: [
      { date: '2026-08-28', day: 'Wed', status: 'ok', time: '08:35 AM' },
      { date: '2026-08-29', day: 'Thu', status: 'ok', time: '08:40 AM' },
      { date: '2026-08-30', day: 'Fri', status: 'ok', time: '08:38 AM' },
      { date: '2026-08-31', day: 'Sat', status: 'ok', time: '08:42 AM' },
      { date: '2026-09-01', day: 'Sun', status: 'ok', time: '08:45 AM' },
      { date: '2026-09-02', day: 'Mon', status: 'ok', time: '08:30 AM' },
      { date: '2026-09-03', day: 'Today', status: 'awaiting', time: undefined },
    ]
  },
  {
    id: 'res-8',
    name: 'Harold Goldberg',
    room: 'Room 05',
    wing: 'Willow Cottage',
    phone: '+27 83 678 1234',
    deviceLinked: false,
    status: 'awaiting',
    notes: 'New phone provided by family. Needs 1-tap device pairing.',
    medicalAlerts: ['Asthma'],
    caregiver: 'Nurse Grace K.',
    emergencyContact: {
      name: 'Rachel Goldberg',
      relationship: 'Daughter',
      phone: '+27 82 777 4433',
      notifyOnIssue: true,
    },
    sevenDayHistory: [
      { date: '2026-08-28', day: 'Wed', status: 'ok', time: '08:12 AM' },
      { date: '2026-08-29', day: 'Thu', status: 'ok', time: '08:15 AM' },
      { date: '2026-08-30', day: 'Fri', status: 'ok', time: '08:20 AM' },
      { date: '2026-08-31', day: 'Sat', status: 'ok', time: '08:10 AM' },
      { date: '2026-09-01', day: 'Sun', status: 'ok', time: '08:18 AM' },
      { date: '2026-09-02', day: 'Mon', status: 'ok', time: '08:11 AM' },
      { date: '2026-09-03', day: 'Today', status: 'awaiting', time: undefined },
    ]
  }
];

// ----------------------------------------------------
// In-Memory Fallback State (Always active if Firebase offline)
// ----------------------------------------------------
let memoryHomes = JSON.parse(JSON.stringify(SEED_HOMES));
let memoryResidents = JSON.parse(JSON.stringify(SEED_RESIDENTS));

// ----------------------------------------------------
// Firebase Admin & Firestore Initialization
// ----------------------------------------------------
let firestoreDb: Firestore | null = null;
let firebaseInitialized = false;
let firebaseError: string | null = null;

function initFirebase() {
  try {
    if (getApps().length > 0) {
      firestoreDb = getFirestore();
      firebaseInitialized = true;
      return firestoreDb;
    }

    let serviceAccount: ServiceAccount | null = null;

    // Check environment variable
    if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
      try {
        serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
      } catch (e) {
        console.warn('Failed to parse FIREBASE_SERVICE_ACCOUNT_KEY env var:', e);
      }
    }

    // Check local credential file
    if (!serviceAccount) {
      const saPath = path.resolve(process.cwd(), 'firebase-service-account.json');
      if (fs.existsSync(saPath)) {
        try {
          const raw = fs.readFileSync(saPath, 'utf-8');
          serviceAccount = JSON.parse(raw);
        } catch (e) {
          console.warn('Failed to parse firebase-service-account.json:', e);
        }
      }
    }

    if (serviceAccount) {
      initializeApp({
        credential: cert(serviceAccount),
        projectId: (serviceAccount as { project_id?: string }).project_id || 'frailcare-checkin',
      });
      firestoreDb = getFirestore();
      firebaseInitialized = true;
      console.log('Firebase Admin initialized successfully with project:', (serviceAccount as { project_id?: string }).project_id);
      
      // Auto seed Firestore asynchronously
      seedFirestoreIfEmpty().catch((err) => {
        console.warn('Firestore initial seeding error:', err.message);
      });
    } else {
      firebaseError = 'No Firebase service account credentials found.';
      console.warn('Firebase credentials not found, running with in-memory sync.');
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    firebaseError = message;
    console.error('Firebase initialization failed, falling back to memory mode:', message);
  }
  return firestoreDb;
}

async function seedFirestoreIfEmpty() {
  if (!firestoreDb) return;
  try {
    const residentsSnap = await firestoreDb.collection('residents').limit(1).get();
    if (residentsSnap.empty) {
      console.log('Seeding initial residents to Firestore...');
      const batch = firestoreDb.batch();
      for (const res of SEED_RESIDENTS) {
        const docRef = firestoreDb.collection('residents').doc(res.id);
        batch.set(docRef, res);
      }
      for (const home of SEED_HOMES) {
        const docRef = firestoreDb.collection('homes').doc(home.id);
        batch.set(docRef, home);
      }
      await batch.commit();
      console.log('Firestore successfully seeded with residents and care homes.');
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.warn('Could not auto-seed Firestore:', message);
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
    projectId: 'frailcare-checkin',
    clientEmail: 'firebase-adminsdk-fbsvc@frailcare-checkin.iam.gserviceaccount.com',
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
        : residentsSnap.docs.map((d) => ({ id: d.id, ...d.data() }));

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

// 4. Add New Resident
app.post('/api/residents', async (req: Request, res: Response) => {
  const newResident = req.body;
  if (!newResident.name || !newResident.room) {
    return res.status(400).json({ error: 'name and room are required' });
  }

  const id = newResident.id || `res-${Date.now()}`;
  const completeResident = {
    ...newResident,
    id,
    status: newResident.status || 'awaiting',
    deviceLinked: newResident.deviceLinked ?? true,
    sevenDayHistory: newResident.sevenDayHistory || [
      { date: '2026-09-03', day: 'Today', status: newResident.status || 'awaiting' },
    ],
  };

  memoryResidents.push(completeResident);

  if (firestoreDb) {
    try {
      await firestoreDb.collection('residents').doc(id).set(completeResident);
    } catch (e: unknown) {
      console.warn('Failed to insert resident in Firestore:', e);
    }
  }

  res.json({ success: true, resident: completeResident });
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
