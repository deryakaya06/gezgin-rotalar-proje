import {
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from 'firebase/firestore';
import { COLLECTIONS, searchKey, type AccountType, type UserProfile, type WithId } from '@repo/shared';

import { db } from '@/firebase';

/**
 * Kayıt sırasında users/{uid} profilini oluşturur. E-posta burada tutulmaz
 * (yalnızca Firebase Auth'ta kalır); diğer kullanıcılar görünen adı görür.
 * firestore.rules yalnızca kişinin kendi profilini, puanlar 0 iken oluşturmasına izin verir.
 */
export function createUserProfile(
  uid: string,
  data: { displayName: string; accountType: AccountType }
) {
  return setDoc(doc(db, COLLECTIONS.users, uid), {
    displayName: data.displayName,
    accountType: data.accountType,
    searchName: searchKey(data.displayName),
    totalPoints: 0,
    visitCount: 0,
    createdAt: serverTimestamp(),
  });
}

/** Arama alanı eksik ya da adla uyuşmuyorsa düzeltir (giriş yapan kullanıcı kendisi için). */
export function syncSearchName(uid: string, profile: UserProfile) {
  const expected = searchKey(profile.displayName);
  if (profile.searchName === expected) return null;
  return updateDoc(doc(db, COLLECTIONS.users, uid), { searchName: expected });
}

/** Görünen adı aranan metinle başlayan kullanıcılar (en fazla 20). */
export async function searchUsers(text: string): Promise<WithId<UserProfile>[]> {
  const q = searchKey(text);
  if (!q) return [];
  const snapshot = await getDocs(
    query(
      collection(db, COLLECTIONS.users),
      where('searchName', '>=', q),
      where('searchName', '<=', q + ''),
      orderBy('searchName'),
      limit(20)
    )
  );
  return snapshot.docs.map((d) => ({ id: d.id, ...(d.data() as UserProfile) }));
}

/** users/{uid}/followers veya following listesindeki kullanıcıların profilleri (en fazla 100). */
export async function fetchFollowList(
  uid: string,
  type: 'followers' | 'following'
): Promise<WithId<UserProfile>[]> {
  const snapshot = await getDocs(
    query(collection(db, COLLECTIONS.users, uid, type), orderBy('createdAt', 'desc'), limit(100))
  );
  const profiles = await Promise.all(
    snapshot.docs.map((d) => getDoc(doc(db, COLLECTIONS.users, d.id)))
  );
  return profiles
    .filter((p) => p.exists())
    .map((p) => ({ id: p.id, ...(p.data() as UserProfile) }));
}
