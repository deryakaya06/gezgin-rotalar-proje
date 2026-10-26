// firestore.rules için emülatör testleri. Çalıştırma: npm test
import assert from 'node:assert/strict';
import { after, test } from 'node:test';

import { deleteApp, initializeApp } from 'firebase/app';
import { connectFirestoreEmulator, doc, getDoc, getFirestore, setDoc, terminate } from 'firebase/firestore';

const [host, port] = process.env.FIRESTORE_EMULATOR_HOST.split(':');
const app = initializeApp({ projectId: 'demo-gezgin', apiKey: 'fake' });
const db = getFirestore(app);
connectFirestoreEmulator(db, host, Number(port));

after(async () => {
  await terminate(db);
  await deleteApp(app);
});

test('kural tanımlanmamış veritabanına okuma ve yazma kapalıdır', async () => {
  await assert.rejects(getDoc(doc(db, 'users', 'x')));
  await assert.rejects(setDoc(doc(db, 'users', 'x'), { a: 1 }));
});
