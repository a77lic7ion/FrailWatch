import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, updateDoc, doc, serverTimestamp } from 'firebase/firestore';
import fs from 'fs';
import path from 'path';

const configPath = path.join(process.cwd(), 'firebase-applet-config.json');
const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
const app = initializeApp(config);
const db = getFirestore(app);

async function bulkRevoke() {
  const residentsRef = collection(db, 'residents');
  const snap = await getDocs(residentsRef);
  const docs = snap.docs;
  console.log(`Found ${docs.length} residents. Revoking...`);
  let count = 0;
  for (const d of docs) {
    const data = d.data();
    const currentVersion = Number(data.verificationVersion || 1);
    const newToken = 'ew_' + Math.random().toString(36).substring(2, 9) + '_' + Date.now().toString(36);
    await updateDoc(doc(db, 'residents', d.id), {
      deviceLinked: false,
      linkedAt: null,
      verificationToken: newToken,
      verificationVersion: currentVersion + 1,
      revokedAt: new Date().toISOString(),
    });
    count++;
  }
  console.log(`Revoked ${count} resident records.`);
}

bulkRevoke()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
