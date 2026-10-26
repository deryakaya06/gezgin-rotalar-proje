// firestore.rules için emülatör testleri. Çalıştırma: npm test
import assert from 'node:assert/strict';
import { after, describe, test } from 'node:test';

import { deleteApp, initializeApp } from 'firebase/app';
import { connectAuthEmulator, createUserWithEmailAndPassword, getAuth } from 'firebase/auth';
import {
  connectFirestoreEmulator,
  deleteDoc,
  doc,
  getDoc,
  getFirestore,
  serverTimestamp,
  setDoc,
  terminate,
  updateDoc,
} from 'firebase/firestore';

const PROJECT_ID = 'demo-gezgin';
const [fsHost, fsPort] = process.env.FIRESTORE_EMULATOR_HOST.split(':');
const [authHost, authPort] = process.env.FIREBASE_AUTH_EMULATOR_HOST.split(':');
const apps = [];

function connect(name) {
  const app = initializeApp({ projectId: PROJECT_ID, apiKey: 'fake' }, `${name}-${apps.length}`);
  apps.push(app);
  const auth = getAuth(app);
  connectAuthEmulator(auth, `http://${authHost}:${authPort}`, { disableWarnings: true });
  const db = getFirestore(app);
  connectFirestoreEmulator(db, fsHost, Number(fsPort));
  return { auth, db };
}

async function signUp(name) {
  const { auth, db } = connect(name);
  const cred = await createUserWithEmailAndPassword(auth, `${name}-${Date.now()}@test.com`, 'secret123');
  return { uid: cred.user.uid, db };
}

/** apps/mobile/src/services/users.ts createUserProfile ile aynı alanlar. */
const newProfile = (displayName, accountType = 'couple') => ({
  displayName,
  accountType,
  totalPoints: 0,
  visitCount: 0,
  createdAt: serverTimestamp(),
});

async function newUser(name) {
  const user = await signUp(name);
  await setDoc(doc(user.db, 'users', user.uid), newProfile(name));
  return user;
}

after(async () => {
  for (const app of apps) {
    await terminate(getFirestore(app));
    await deleteApp(app);
  }
});

describe('kayıt: profil oluşturma', () => {
  test('kullanıcı kendi profilini oluşturabilir (çift ve arkadaş hesabı)', async () => {
    const a = await signUp('cift');
    await setDoc(doc(a.db, 'users', a.uid), newProfile('Ayşe & Mehmet', 'couple'));
    const b = await signUp('arkadas');
    await setDoc(doc(b.db, 'users', b.uid), newProfile('Kadıköy Gezginleri', 'friends'));
  });

  test('sıfırdan farklı puanla profil oluşturulamaz', async () => {
    const eve = await signUp('eve');
    await assert.rejects(setDoc(doc(eve.db, 'users', eve.uid), { ...newProfile('Eve'), totalPoints: 999 }));
  });

  test('başkasının profili oluşturulamaz', async () => {
    const eve = await signUp('eve');
    await assert.rejects(setDoc(doc(eve.db, 'users', 'baska-biri'), newProfile('Sahte')));
  });

  test('geçersiz ad, hesap türü veya fazladan alan reddedilir', async () => {
    const eve = await signUp('eve');
    const ref = doc(eve.db, 'users', eve.uid);
    await assert.rejects(setDoc(ref, newProfile('E')), 'tek harfli ad');
    await assert.rejects(setDoc(ref, newProfile('Eve', 'aile')), 'bilinmeyen hesap türü');
    await assert.rejects(setDoc(ref, { ...newProfile('Eve'), role: 'admin' }), 'kendine rol verme');
    await assert.rejects(setDoc(ref, { ...newProfile('Eve'), email: 'eve@test.com' }), 'e-posta profilde tutulmaz');
  });
});

describe('profil güncelleme', () => {
  test('görünen ad ve hesap türü değiştirilebilir', async () => {
    const bob = await newUser('bob');
    await updateDoc(doc(bob.db, 'users', bob.uid), { displayName: 'Bob & Ece', accountType: 'friends' });
  });

  test('puan doğrudan değiştirilemez', async () => {
    const bob = await newUser('bob');
    await assert.rejects(updateDoc(doc(bob.db, 'users', bob.uid), { totalPoints: 500 }));
  });

  test('başkasının profili değiştirilemez ve profil silinemez', async () => {
    const bob = await newUser('bob');
    const alice = await newUser('alice');
    await assert.rejects(updateDoc(doc(alice.db, 'users', bob.uid), { displayName: 'Ele geçirildi' }));
    await assert.rejects(deleteDoc(doc(bob.db, 'users', bob.uid)));
  });
});

describe('okuma', () => {
  test('giriş yapmış kullanıcı profilleri okuyabilir, giriş yapmamış okuyamaz', async () => {
    const bob = await newUser('bob');
    const alice = await newUser('alice');
    assert.equal((await getDoc(doc(alice.db, 'users', bob.uid))).data().displayName, 'bob');

    const anon = connect('anonim');
    await assert.rejects(getDoc(doc(anon.db, 'users', bob.uid)));
  });

  test('kuralı olmayan koleksiyonlar kapalıdır', async () => {
    const bob = await newUser('bob');
    await assert.rejects(setDoc(doc(bob.db, 'check_ins', 'x'), { a: 1 }));
  });
});
