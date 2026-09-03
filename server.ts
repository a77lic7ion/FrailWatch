import express, { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import { initializeApp, cert, getApps, ServiceAccount, getApp } from 'firebase-admin/app';
import { getFirestore, Firestore, FieldValue } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT || process.env.PORT_8260 || 3000);
let adminAuth: ReturnType<typeof getAuth> | null = null;

app.use(express.json());

const SEED_HOMES = [
  { id: 'home-benoni-01', name: 'Benoni Frail Care & Assisted Living', location: 'Willow Lane, Benoni', totalResidents: 24, cutoffTime: '09:15', careStaffOnDuty: 4, primaryNurse: 'Sr. Sarah Botha, RN', providerPartner: '4TIFY SECURITY & Care Solutions' },
  { id: 'home-stjude-02', name: 'St. Jude Senior Manor', location: 'Highland Ridge, Bryanston', totalResidents: 18, cutoffTime: '09:00', careStaffOnDuty: 3, primaryNurse: 'Sr. Thandi Ndlovu', providerPartner: '4TIFY SECURITY & Care Solutions' }
];
const SEED_RESIDENTS: any[] = [];
let memoryHomes = JSON.parse(JSON.stringify(SEED_HOMES));
let memoryResidents: any[] = [];

let firestoreDb: Firestore | null = null;
let firebaseInitialized = false;
let firebaseError: string | null = null;
let activeProjectId = 'frailcare-checkin';
let activeDatabaseId = '';

function initFirebase() {
  try {
    if (getApps().length > 0) {
      firestoreDb = activeDatabaseId ? getFirestore(getApps()[0], activeDatabaseId) : getFirestore();
      firebaseInitialized = true;
      return firestoreDb;
    }
    let serviceAccount: ServiceAccount | null = null;
    const saPath = path.resolve(process.cwd(), 'firebase-service-account.json');
    if (fs.existsSync(saPath)) {
      try { serviceAccount = JSON.parse(fs.readFileSync(saPath, 'utf-8')); } catch {}
    }
    if (serviceAccount) {
      initializeApp({ credential: cert(serviceAccount), projectId: (serviceAccount as any).project_id || activeProjectId });
    } else {
      initializeApp({ projectId: activeProjectId });
    }
    firestoreDb = activeDatabaseId ? getFirestore(getApps()[0], activeDatabaseId) : getFirestore();
    firebaseInitialized = true;
    console.log('Firebase Admin initialized for:', activeProjectId);
  } catch (err: any) {
    firebaseError = err?.message || String(err);
    console.error('Firebase initialization:', firebaseError);
  }
  return firestoreDb;
}
initFirebase();
if (getApps().length > 0) {
  adminAuth = getAuth(getApps()[0]);
}

async function requireStaff(req: Request, res: Response, next: () => void) {
  const token = String(req.headers.authorization || '').replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'Missing token' });
  try {
    const decoded = await adminAuth.verifyIdToken(token);
    const doc = await firestoreDb?.collection('staff').doc(decoded.uid).get();
    if (!doc?.exists) return res.status(403).json({ error: 'No staff profile' });
    (req as any).staff = { uid: decoded.uid, email: decoded.email, ...doc.data() };
    return next();
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return res.status(401).json({ error: message });
  }
}

function canAccessHome(staff: any, homeId: string) {
  return staff.role === 'superadmin' || staff.homeId === '*' || staff.homeId === homeId;
}

app.get('/api/health', async (_req: Request, res: Response) => {
  let isConnected = false;
  let residentCount = memoryResidents.length;
  let errorMsg = firebaseError;
  if (firestoreDb) {
    try {
      const snap = await firestoreDb.collection('residents').get();
      isConnected = true;
      residentCount = snap.size;
    } catch (e: any) {
      isConnected = false;
      errorMsg = e?.message || String(e);
    }
  }
  res.json({ status: 'ok', firebaseInitialized, firebaseConnected: isConnected, projectId: activeProjectId, clientEmail: `firebase-adminsdk@${activeProjectId}.iam.gserviceaccount.com`, residentCount, error: errorMsg });
});

app.get('/api/data', requireStaff, async (req: Request, res: Response) => {
  const staff: any = (req as any).staff;
  try {
    const [homesSnap, residentsSnap] = await Promise.all([
      firestoreDb?.collection('homes').get() as any,
      firestoreDb?.collection('residents').get() as any,
    ]);
    let homes = homesSnap?.docs.map((d: any) => ({ id: d.id, ...d.data() })) || memoryHomes;
    let residents = residentsSnap?.docs.map((d: any) => {
      const data = d.data();
      return { id: d.id, ...data, homeId: data.homeId || 'home-benoni-01', verificationToken: data.verificationToken || `ew_${d.id}`, deviceLinked: !!data.deviceLinked, wing: data.wing || 'Willow Cottage', sevenDayHistory: Array.isArray(data.sevenDayHistory) && data.sevenDayHistory.length ? data.sevenDayHistory : [{ date: '2026-09-03', day: 'Today', status: data.status || 'awaiting' }], emergencyContact: data.emergencyContact || { name: 'Emergency Contact', relationship: 'Family', phone: '+27 82 111 2222', notifyOnIssue: true } };
    }) || memoryResidents;

    if (!canAccessHome(staff, '*')) {
      homes = homes.filter((h: any) => h.id === staff.homeId);
      residents = residents.filter((r: any) => r.homeId === staff.homeId);
    }
    memoryHomes = homes;
    memoryResidents = residents;
    return res.json({ homes, residents, source: 'firestore', timestamp: new Date().toISOString() });
  } catch {
    return res.json({ homes: memoryHomes, residents: memoryResidents, source: 'local_fallback', timestamp: new Date().toISOString() });
  }
});

app.post('/api/checkin', async (req: Request, res: Response) => {
  const { residentId, status, checkInTime } = req.body;
  if (!residentId || !status) return res.status(400).json({ error: 'residentId and status are required' });
  const time = checkInTime || (status === 'awaiting' ? undefined : new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
  const idx = memoryResidents.findIndex((r) => r.id === residentId);
  let targetHomeId = 'home-benoni-01';
  if (idx !== -1) {
    memoryResidents[idx].status = status;
    memoryResidents[idx].checkInTime = time;
    targetHomeId = memoryResidents[idx].homeId || targetHomeId;
  } else if (firestoreDb) {
    try {
      const snap = await firestoreDb.collection('residents').doc(residentId).get();
      if (snap.exists) targetHomeId = snap.data().homeId || targetHomeId;
    } catch {}
  }
  if (firestoreDb) {
    try {
      const today = new Date().toISOString().slice(0,10);
      await firestoreDb.collection('residents').doc(residentId).set({ status, checkInTime: time }, { merge: true });
      const phone = idx > -1 ? memoryResidents[idx].phone || '' : '';
      const entryRef = firestoreDb.collection('homes').doc(targetHomeId).collection('checkins').doc(today).collection('entries').doc(residentId.includes('_') ? residentId.split('_').pop() || residentId : residentId);
      await entryRef.set({ status, timestamp: FieldValue.serverTimestamp(), homeId: targetHomeId, phone }, { merge: true });
      await firestoreDb.collection('checkin_events').add({ residentId, homeId: targetHomeId, status, checkInTime: time, recordedAt: FieldValue.serverTimestamp() });
    } catch (e: unknown) { console.warn('Failed to update Firestore check-in:', e); }
  }
  res.json({ success: true, residentId, status, checkInTime: time });
});

app.post('/api/phone-login', async (req: Request, res: Response) => {
  const { phone } = req.body || {};
  if (!phone) return res.status(400).json({ error: 'Missing phone' });
  if (firestoreDb) {
    try {
      const snap = await firestoreDb.collection('residents').where('phone', '==', phone).limit(1).get();
      if (!snap.empty) {
        const doc = snap.docs[0];
        const data = doc.data();
        await doc.ref.set({ deviceLinked: true, verifiedAt: new Date().toISOString() }, { merge: true });
        return res.json({ success: true, resident: { id: doc.id, ...data } });
      }
    } catch (e: unknown) { console.warn('phone-login firestore error', e); }
  }
  const local = memoryResidents.find((r) => r.phone === phone);
  if (local) {
    const idx = memoryResidents.findIndex((r) => r.phone === phone);
    if (idx !== -1) memoryResidents[idx].deviceLinked = true;
    return res.json({ success: true, resident: local });
  }
  return res.status(404).json({ error: 'Not found. Ask staff to add you first.' });
});

app.post('/api/residents', requireStaff, async (req: Request, res: Response) => {
  const staff: any = (req as any).staff;
  const newResident = req.body;
  const targetHomeId = newResident.homeId || staff.homeId;
  if (!canAccessHome(staff, targetHomeId)) return res.status(403).json({ error: 'Forbidden' });
  if (!newResident.name || !newResident.room) return res.status(400).json({ error: 'name and room are required' });
  const id = `${targetHomeId}_${String(newResident.phone || '').trim()}`;
  const verificationToken = newResident.verificationToken || ('ew_' + Math.random().toString(36).substring(2, 9) + '_' + Date.now().toString(36));
  const completeResident = { ...newResident, id, homeId: targetHomeId, verificationToken, status: newResident.status || 'awaiting', deviceLinked: !!newResident.deviceLinked, createdAt: new Date().toISOString() };
  memoryResidents.push(completeResident);
  if (firestoreDb) {
    try {
      await firestoreDb.collection('residents').doc(id).set(completeResident);
      await firestoreDb.collection('checkin_events').add({ residentId: id, homeId: targetHomeId, event: 'resident_created_by_admin', name: completeResident.name, phone: completeResident.phone, verificationToken, recordedAt: FieldValue.serverTimestamp() });
    } catch (e: unknown) { console.warn('Failed to insert resident in Firestore:', e); }
  }
  res.json({ success: true, resident: completeResident, verificationToken, verificationUrl: `/?verify=${verificationToken}&home=${targetHomeId}` });
});

app.get('/api/staff', requireStaff, async (req: Request, res: Response) => {
  const staff: any = (req as any).staff;
  const snap = await firestoreDb?.collection('staff').get();
  let staffList: any[] = snap ? snap.docs.map((d) => ({ uid: d.id, ...d.data() })) : [];
  if (!canAccessHome(staff, '*')) staffList = staffList.filter((s) => s.homeId === staff.homeId);
  res.json({ staff: staffList });
});

app.post('/api/staff', requireStaff, async (req: Request, res: Response) => {
  const staff: any = (req as any).staff;
  if (!canAccessHome(staff, '*')) return res.status(403).json({ error: 'Forbidden' });
  const { email, password, name, homeId, role } = req.body || {};
  if (!email || !password || !homeId) return res.status(400).json({ error: 'Missing fields' });
  try {
    const user = await adminAuth.createUser({ email, password, displayName: name || '' });
    await firestoreDb?.collection('staff').doc(user.uid).set({ homeId, role: role || 'home_admin', name: name || '', email });
    res.json({ uid: user.uid });
  } catch (e: any) {
    res.status(400).json({ error: e.message || 'Create staff failed' });
  }
});

app.post('/api/staff-login', requireStaff, async (req: Request, res: Response) => {
  res.json({ staff: (req as any).staff });
});

app.get('/api/staff-me', requireStaff, async (req: Request, res: Response) => {
  res.json({ staff: (req as any).staff });
});

app.post('/api/staff-logout', (_req: Request, res: Response) => res.json({ success: true }));

app.get('/api/homes', requireStaff, async (req: Request, res: Response) => {
  const staff: any = (req as any).staff;
  let homes = memoryHomes;
  if (firestoreDb) {
    try {
      const snap = await firestoreDb.collection('homes').get();
      homes = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      memoryHomes = homes;
    } catch {}
  }
  if (!canAccessHome(staff, '*')) homes = homes.filter((h: any) => h.id === staff.homeId);
  res.json({ homes });
});

app.post('/api/homes', requireStaff, async (req: Request, res: Response) => {
  const staff: any = (req as any).staff;
  if (!canAccessHome(staff, '*')) return res.status(403).json({ error: 'Forbidden' });
  const { id, name, location, cutoffTime, careStaffOnDuty, primaryNurse, providerPartner } = req.body || {};
  if (!id || !name) return res.status(400).json({ error: 'Missing id or name' });
  const home = { id, name, location: location || '', cutoffTime: cutoffTime || '09:00', careStaffOnDuty: Number(careStaffOnDuty || 0), primaryNurse: primaryNurse || '', providerPartner: providerPartner || '' };
  memoryHomes.push(home);
  if (firestoreDb) {
    try { await firestoreDb.collection('homes').doc(id).set(home); } catch {}
  }
  res.json({ home });
});

app.get('/api/residents', requireStaff, async (req: Request, res: Response) => {
  const staff: any = (req as any).staff;
  const homeId = String(req.query.homeId || '');
  let residents = memoryResidents;
  if (firestoreDb) {
    try {
      const snap = await firestoreDb.collection('residents').get();
      residents = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      memoryResidents = residents;
    } catch {}
  }
  if (!canAccessHome(staff, '*')) residents = residents.filter((r: any) => r.homeId === staff.homeId);
  if (homeId && !canAccessHome(staff, homeId)) return res.status(403).json({ error: 'Forbidden' });
  if (homeId) residents = residents.filter((r: any) => r.homeId === homeId);
  res.json({ residents });
});

const performVerification = async (token?: string, residentId?: string, res?: Response) => {
  let resident: any = memoryResidents.find((r) => (token && r.verificationToken === token) || (residentId && r.id === residentId));
  if (!resident && firestoreDb) {
    try {
      if (token) {
        const snap = await firestoreDb.collection('residents').where('verificationToken', '==', token).limit(1).get();
        if (!snap.empty) { const doc = snap.docs[0]; resident = { id: doc.id, ...doc.data() }; }
      }
      if (!resident && residentId) {
        const doc = await firestoreDb.collection('residents').doc(residentId).get();
        if (doc.exists) resident = { id: doc.id, ...doc.data() };
      }
    } catch (e) { console.warn('Firestore verification lookup error:', e); }
  }
  if (!resident) return res?.status(404).json({ error: 'Invalid or expired verification link.' });
  const verifiedAt = new Date().toISOString();
  resident.deviceLinked = true;
  resident.verifiedAt = verifiedAt;
  const idx = memoryResidents.findIndex((r) => r.id === resident.id);
  if (idx !== -1) { memoryResidents[idx].deviceLinked = true; memoryResidents[idx].verifiedAt = verifiedAt; }
  if (firestoreDb) {
    try {
      await firestoreDb.collection('residents').doc(resident.id).set({ deviceLinked: true, verifiedAt }, { merge: true });
      await firestoreDb.collection('checkin_events').add({ residentId: resident.id, homeId: resident.homeId || 'home-benoni-01', event: 'device_verified_and_attached', phone: resident.phone, recordedAt: FieldValue.serverTimestamp() });
    } catch (e) { console.warn('Failed to update verified resident in Firestore:', e); }
  }
  const targetHomeId = resident.homeId || 'home-benoni-01';
  let home = memoryHomes.find((h) => h.id === targetHomeId);
  if (!home && firestoreDb) {
    try { const homeDoc = await firestoreDb.collection('homes').doc(targetHomeId).get(); if (homeDoc.exists) home = { id: homeDoc.id, ...homeDoc.data() }; } catch {}
  }
  return res?.json({ success: true, message: `Device verified and attached to ${home?.name || 'Care Home'}`, resident, home: home || memoryHomes[0] });
};

app.post('/api/verify', async (req: Request, res: Response) => { const token = (req.body.token || req.query.token) as string; const residentId = (req.body.residentId || req.query.residentId) as string; return performVerification(token, residentId, res); });
app.get('/api/verify', async (req: Request, res: Response) => { const token = req.query.token as string; const residentId = req.query.residentId as string; return performVerification(token, residentId, res); });
app.get('/api/resident/:idOrToken', async (req: Request, res: Response) => {
  const { idOrToken } = req.params;
  let resident: any = memoryResidents.find((r) => r.id === idOrToken || r.verificationToken === idOrToken);
  if (!resident && firestoreDb) {
    try {
      const doc = await firestoreDb.collection('residents').doc(idOrToken).get();
      if (doc.exists) resident = { id: doc.id, ...doc.data() }; else {
        const snap = await firestoreDb.collection('residents').where('verificationToken', '==', idOrToken).limit(1).get();
        if (!snap.empty) resident = { id: snap.docs[0].id, ...snap.docs[0].data() };
      }
    } catch (e) { console.warn('Error fetching single resident from Firestore:', e); }
  }
  if (!resident) return res.status(404).json({ error: 'Resident profile not found' });
  const targetHomeId = resident.homeId || 'home-benoni-01';
  const home = memoryHomes.find((h) => h.id === targetHomeId) || memoryHomes[0];
  res.json({ resident, home });
});

app.delete('/api/homes/:id', requireStaff, async (req: Request, res: Response) => {
  const staff: any = (req as any).staff;
  const { id } = req.params;
  const home = memoryHomes.find((h) => h.id === id);
  if (!home) return res.status(404).json({ error: 'Home not found' });
  if (!canAccessHome(staff, id)) return res.status(403).json({ error: 'Forbidden' });
  memoryHomes = memoryHomes.filter((h) => h.id !== id);
  if (firestoreDb) {
    try { await firestoreDb.collection('homes').doc(id).delete(); } catch {}
  }
  res.json({ success: true, id });
});

app.put('/api/homes/:id', requireStaff, async (req: Request, res: Response) => {
  const staff: any = (req as any).staff;
  const { id } = req.params;
  if (!canAccessHome(staff, id)) return res.status(403).json({ error: 'Forbidden' });
  const updates = req.body || {};
  const idx = memoryHomes.findIndex((h) => h.id === id);
  if (idx === -1) return res.status(404).json({ error: 'Home not found' });
  memoryHomes[idx] = { ...memoryHomes[idx], ...updates };
  if (firestoreDb) {
    try { await firestoreDb.collection('homes').doc(id).set(updates, { merge: true }); } catch {}
  }
  res.json({ success: true, home: memoryHomes[idx] });
});

app.put('/api/staff/:uid', requireStaff, async (req: Request, res: Response) => {
  const staff: any = (req as any).staff;
  const { uid } = req.params;
  const target = (await firestoreDb?.collection('staff').doc(uid).get());
  const targetData = target?.data();
  const targetHomeId = targetData?.homeId;
  if (!canAccessHome(staff, targetHomeId)) return res.status(403).json({ error: 'Forbidden' });
  const updates = req.body || {};
  if (firestoreDb) {
    try { await firestoreDb.collection('staff').doc(uid).set(updates, { merge: true }); } catch (e: unknown) { return res.status(500).json({ error: 'Firestore update failed' }); }
  }
  res.json({ success: true, uid, updates });
});

app.delete('/api/staff/:uid', requireStaff, async (req: Request, res: Response) => {
  const staff: any = (req as any).staff;
  const { uid } = req.params;
  const target = await firestoreDb?.collection('staff').doc(uid).get();
  const targetData = target?.data();
  const targetHomeId = targetData?.homeId;
  if (!canAccessHome(staff, targetHomeId)) return res.status(403).json({ error: 'Forbidden' });
  if (firestoreDb) {
    try { await firestoreDb.collection('staff').doc(uid).delete(); } catch (e: unknown) { return res.status(500).json({ error: 'Firestore delete failed' }); }
  }
  res.json({ success: true, uid });
});

app.put('/api/residents/:id', requireStaff, async (req: Request, res: Response) => {
  const staff: any = (req as any).staff;
  const { id } = req.params;
  const updates = req.body;
  const existing = memoryResidents.find((r) => r.id === id);
  if (existing && !canAccessHome(staff, existing.homeId)) return res.status(403).json({ error: 'Forbidden' });
  const idx = memoryResidents.findIndex((r) => r.id === id);
  if (idx !== -1) memoryResidents[idx] = { ...memoryResidents[idx], ...updates };
  if (firestoreDb) {
    try { await firestoreDb.collection('residents').doc(id).set(updates, { merge: true }); } catch (e: unknown) { console.warn('Failed to update resident in Firestore:', e); }
  }
  res.json({ success: true, id, updates });
});

app.delete('/api/residents/:id', requireStaff, async (req: Request, res: Response) => {
  const staff: any = (req as any).staff;
  const { id } = req.params;
  const existing = memoryResidents.find((r) => r.id === id);
  if (existing && !canAccessHome(staff, existing.homeId)) return res.status(403).json({ error: 'Forbidden' });
  memoryResidents = memoryResidents.filter((r) => r.id !== id);
  if (firestoreDb) {
    try { await firestoreDb.collection('residents').doc(id).delete(); } catch (e: unknown) { console.warn('Failed to delete resident from Firestore:', e); }
  }
  res.json({ success: true, id });
});

app.put('/api/cutoff', requireStaff, async (req: Request, res: Response) => {
  const staff: any = (req as any).staff;
  const { homeId, cutoffTime } = req.body;
  if (!homeId || !cutoffTime) return res.status(400).json({ error: 'homeId and cutoffTime are required' });
  if (!canAccessHome(staff, homeId)) return res.status(403).json({ error: 'Forbidden' });
  const idx = memoryHomes.findIndex((h) => h.id === homeId);
  if (idx !== -1) memoryHomes[idx].cutoffTime = cutoffTime;
  if (firestoreDb) {
    try { await firestoreDb.collection('homes').doc(homeId).set({ cutoffTime }, { merge: true }); } catch (e: unknown) { console.warn('Failed to update cutoff time in Firestore:', e); }
  }
  res.json({ success: true, homeId, cutoffTime });
});

app.post('/api/reset-demo', async (_req: Request, res: Response) => {
  memoryHomes = JSON.parse(JSON.stringify(SEED_HOMES));
  memoryResidents = JSON.parse(JSON.stringify(SEED_RESIDENTS));
  if (firestoreDb) {
    try {
      const batch = firestoreDb.batch();
      for (const r of SEED_RESIDENTS) batch.set(firestoreDb.collection('residents').doc(r.id), r);
      for (const h of SEED_HOMES) batch.set(firestoreDb.collection('homes').doc(h.id), h);
      await batch.commit();
    } catch (e: unknown) { console.warn('Failed to reset demo in Firestore:', e); }
  }
  res.json({ success: true, homes: memoryHomes, residents: memoryResidents });
});

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({ server: { middlewareMode: true }, appType: 'spa' });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => res.sendFile(path.join(distPath, 'index.html')));
  }
  app.listen(PORT, '0.0.0.0', () => console.log(`Server listening at http://0.0.0.0:${PORT}`));
}
startServer();
