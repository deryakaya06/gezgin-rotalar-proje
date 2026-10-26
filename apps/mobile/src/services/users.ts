import { doc, serverTimestamp, setDoc } from 'firebase/firestore';
import { COLLECTIONS, type AccountType } from '@repo/shared';

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
    totalPoints: 0,
    visitCount: 0,
    createdAt: serverTimestamp(),
  });
}
