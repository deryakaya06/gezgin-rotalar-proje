// firestore.rules için emülatör testleri. Çalıştırma: npm test
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { after, describe, test } from 'node:test';

import { deleteApp, initializeApp } from 'firebase/app';
import { connectAuthEmulator, createUserWithEmailAndPassword, getAuth } from 'firebase/auth';
import {
  collection,
  connectFirestoreEmulator,
  deleteDoc,
  doc,
  getCountFromServer,
  getDoc,
  getDocs,
  getFirestore,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  terminate,
  updateDoc,
  where,
  writeBatch,
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

// "Bearer owner" ile emülatörün REST API'si kuralları atlar (veri hazırlamak için).
async function adminSet(path, fields) {
  const res = await fetch(
    `http://${fsHost}:${fsPort}/v1/projects/${PROJECT_ID}/databases/(default)/documents/${path}`,
    {
      method: 'PATCH',
      headers: { Authorization: 'Bearer owner', 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fields: Object.fromEntries(
          Object.entries(fields).map(([k, v]) => [
            k,
            typeof v === 'number' ? { integerValue: String(v) } : { stringValue: String(v) },
          ])
        ),
      }),
    }
  );
  assert.ok(res.ok, `adminSet ${path}: ${res.status}`);
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

/** apps/mobile/src/services/follows.ts ile aynı batch; seçeneklerle hile denenir. */
function followBatch(me, targetUid, { following = true, mirror = true, remove = false } = {}) {
  const batch = writeBatch(me.db);
  const followingRef = doc(me.db, 'users', me.uid, 'following', targetUid);
  const mirrorRef = doc(me.db, 'users', targetUid, 'followers', me.uid);
  if (following) remove ? batch.delete(followingRef) : batch.set(followingRef, { createdAt: serverTimestamp() });
  if (mirror) remove ? batch.delete(mirrorRef) : batch.set(mirrorRef, { createdAt: serverTimestamp() });
  return batch.commit();
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

describe('takip', () => {
  test('takip et / bırak iki tarafı birlikte günceller ve count() doğru sayar', async () => {
    const alice = await newUser('alice');
    const bob = await newUser('bob');

    await followBatch(alice, bob.uid);
    const followers = await getCountFromServer(collection(alice.db, 'users', bob.uid, 'followers'));
    const following = await getCountFromServer(collection(alice.db, 'users', alice.uid, 'following'));
    assert.equal(followers.data().count, 1);
    assert.equal(following.data().count, 1);

    await followBatch(alice, bob.uid, { remove: true });
    const after = await getCountFromServer(collection(alice.db, 'users', bob.uid, 'followers'));
    assert.equal(after.data().count, 0);
  });

  test('tek taraflı takip kaydı yazılamaz', async () => {
    const alice = await newUser('alice');
    const bob = await newUser('bob');
    await assert.rejects(followBatch(alice, bob.uid, { mirror: false }));
    await assert.rejects(followBatch(alice, bob.uid, { following: false }));
  });

  test('takip bırakılırken tek taraf silinemez', async () => {
    const alice = await newUser('alice');
    const bob = await newUser('bob');
    await followBatch(alice, bob.uid);
    await assert.rejects(followBatch(alice, bob.uid, { remove: true, mirror: false }));
  });

  test('başkası adına takipçi eklenemez, kendini ve olmayan kullanıcıyı takip edemezsin', async () => {
    const alice = await newUser('alice');
    const bob = await newUser('bob');
    const carol = await newUser('carol');
    await assert.rejects(
      setDoc(doc(alice.db, 'users', carol.uid, 'followers', bob.uid), { createdAt: serverTimestamp() })
    );
    await assert.rejects(followBatch(alice, alice.uid));
    await assert.rejects(followBatch(alice, 'olmayan-kullanici'));
  });
});

describe('kullanıcı arama', () => {
  test('profil arama alanıyla oluşturulur ve sahibi güncelleyebilir', async () => {
    const eve = await signUp('eve');
    await setDoc(doc(eve.db, 'users', eve.uid), { ...newProfile('Ayşe'), searchName: 'ayse' });
    await updateDoc(doc(eve.db, 'users', eve.uid), { displayName: 'Ayşe & Can', searchName: 'ayse & can' });
  });

  test('çok uzun arama alanı reddedilir, başkasının arama alanı değiştirilemez', async () => {
    const eve = await signUp('eve');
    await assert.rejects(
      setDoc(doc(eve.db, 'users', eve.uid), { ...newProfile('Eve'), searchName: 'x'.repeat(61) })
    );
    const bob = await newUser('bob');
    await assert.rejects(updateDoc(doc(bob.db, 'users', 'baska-biri'), { searchName: 'hedef' }));
  });

  test('"ay" ile başlayan arama alanları bulunur', async () => {
    const a = await signUp('arama');
    await setDoc(doc(a.db, 'users', a.uid), { ...newProfile('Aydın & Ece'), searchName: 'aydin & ece' });
    const b = await signUp('arama2');
    await setDoc(doc(b.db, 'users', b.uid), { ...newProfile('Zeynep'), searchName: 'zeynep' });

    const snap = await getDocs(
      query(collection(a.db, 'users'), where('searchName', '>=', 'ay'), where('searchName', '<=', 'ay\uf8ff'), orderBy('searchName'))
    );
    const names = snap.docs.map((d) => d.get('searchName'));
    assert.ok(names.includes('aydin & ece'));
    assert.ok(!names.includes('zeynep'));
  });
});

describe('locations (admin)', () => {
  const validLocation = () => ({
    name: 'Moda Sahili',
    description: 'Gün batımı için.',
    district: 'Kadıköy',
    category: 'Park',
    coordinates: { latitude: 40.981, longitude: 29.026 },
    rating: 4.7,
    isFree: true,
    isSponsored: false,
    sponsorInfo: null,
  });

  async function adminUser() {
    const admin = await newUser('admin');
    await adminSet(`users/${admin.uid}`, {
      displayName: 'admin',
      accountType: 'friends',
      totalPoints: 0,
      visitCount: 0,
      role: 'admin',
    });
    return admin;
  }

  test('admin mekan ekleyebilir ve güncelleyebilir', async () => {
    const admin = await adminUser();
    await setDoc(doc(admin.db, 'locations', 'moda'), validLocation());
    await updateDoc(doc(admin.db, 'locations', 'moda'), {
      isSponsored: true,
      sponsorInfo: { name: 'Moda Kahvecisi', offer: 'Check-in yapana %10 indirim' },
    });
  });

  test('admin kapak fotoğrafı ekleyebilir, başka siteden adres reddedilir', async () => {
    const admin = await adminUser();
    const rulesText = readFileSync(new URL('../firestore.rules', import.meta.url), 'utf8');
    const cloudName = rulesText.match(/function cloudinaryCloudName\(\) \{\s*return '([^']+)'/)[1];
    await setDoc(doc(admin.db, 'locations', 'kapakli'), {
      ...validLocation(),
      coverPhotoUrl: `https://res.cloudinary.com/${cloudName}/image/upload/v1/kapak.jpg`,
      coverPhotoCredit: 'A.Savin · FAL',
      coverPhotoSource: 'https://commons.wikimedia.org/wiki/File:Ornek.jpg',
    });
    await assert.rejects(
      setDoc(doc(admin.db, 'locations', 'kapaksiz'), {
        ...validLocation(),
        coverPhotoUrl: 'https://kotu-site.com/kapak.jpg',
      })
    );
  });

  test('normal kullanıcı mekan ekleyemez', async () => {
    const bob = await newUser('bob');
    await assert.rejects(setDoc(doc(bob.db, 'locations', 'sahte'), validLocation()));
  });

  test('geçersiz mekan verisi reddedilir', async () => {
    const admin = await adminUser();
    await assert.rejects(setDoc(doc(admin.db, 'locations', 'x1'), { ...validLocation(), rating: 9 }));
    await assert.rejects(
      setDoc(doc(admin.db, 'locations', 'x2'), {
        ...validLocation(),
        coordinates: { latitude: 200, longitude: 29 },
      })
    );
    await assert.rejects(setDoc(doc(admin.db, 'locations', 'x3'), { ...validLocation(), hack: true }));
  });

  test('kullanıcı kendine admin rolü veremez', async () => {
    const eve = await signUp('eve');
    await assert.rejects(setDoc(doc(eve.db, 'users', eve.uid), { ...newProfile('Eve'), role: 'admin' }));
    const bob = await newUser('bob');
    await assert.rejects(updateDoc(doc(bob.db, 'users', bob.uid), { role: 'admin' }));
  });
});
