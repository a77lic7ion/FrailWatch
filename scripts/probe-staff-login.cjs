const admin = require('firebase-admin');
const http = require('http');

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(require('./firebase-service-account.json')),
    projectId: 'frailcare-checkin',
  });
}

async function main() {
  const db = admin.firestore();
  const snap = await db.collection('staff').get();
  console.log('FIRESTORE STAFF DOCS:');
  snap.forEach((d) => console.log(d.id, JSON.stringify(d.data())));

  const tokenResp = await new Promise((resolve, reject) => {
    const data = JSON.stringify({ email: 'shaunwgordon@gmail.com', password: 'B33tl3sL1lly@123' });
    const req = http.request({ hostname: '127.0.0.1', port: 8260, path: '/api/staff-login', method: 'POST', headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(data) } }, (res) => {
      let body = '';
      res.on('data', (c) => (body += c));
      res.on('end', () => resolve({ status: res.statusCode, body }));
    });
    req.on('error', reject);
    req.write(data);
    req.end();
  });

  console.log('STAFF-LOGIN STATUS:', tokenResp.status);
  console.log('STAFF-LOGIN BODY:', tokenResp.body);
  process.exit(0);
}

main().catch((e) => { console.error(e); process.exit(1); });
