/**
 * Firestore veri modeli. Mobil uygulama ve web admin paneli bu tipleri ortak kullanır.
 * Zaman alanları Firestore Timestamp'tir; paket Firebase'e bağımlı olmasın diye
 * yalnızca kullanılan yüzeyi tanımlıyoruz.
 */
export type FirestoreTimestamp = { toDate(): Date };

export type AccountType = 'couple' | 'friends';

/**
 * users/{uid} — herkese açık profil. E-posta burada tutulmaz, Firebase Auth'ta kalır.
 * Takipçi/takip sayıları alan olarak tutulmaz; followers/following alt
 * koleksiyonlarından count() ile hesaplanır.
 */
export type UserProfile = {
  displayName: string;
  accountType: AccountType;
  /** Check-in'lerle kazanılan puan (Sprint 4); kayıtta 0. */
  totalPoints: number;
  /** Ziyaret edilen mekan sayısı (Sprint 4); kayıtta 0. */
  visitCount: number;
  createdAt: FirestoreTimestamp | null;
  /** searchKey(displayName); kullanıcı araması için. */
  searchName?: string;
};

/** users/{uid}/following/{targetId} ve users/{uid}/followers/{followerId} */
export type FollowEntry = {
  createdAt: FirestoreTimestamp | null;
};

export type Coordinates = { latitude: number; longitude: number };

export type SponsorInfo = {
  /** Sponsor firmanın adı (ör. kafe zinciri). */
  name: string;
  /** Kullanıcıya gösterilecek kampanya/indirim metni. */
  offer?: string;
  url?: string;
};

/**
 * locations/{id} — yalnızca admin yazabilir (firestore.rules).
 * İlk sürümde eklenen mekanlarda name/description dışındaki alanlar olmayabilir.
 */
export type Location = {
  name: string;
  description: string;
  /** İlçe, ör. "Kadıköy". Keşfet'teki hızlı filtreler bunu kullanır. */
  district?: string;
  /** Ör. "Tarihi", "Müze", "Park", "Manzara", "Çarşı". */
  category?: string;
  coordinates?: Coordinates;
  /** 0–5 arası ortalama puan. */
  rating?: number;
  isFree?: boolean;
  isSponsored?: boolean;
  sponsorInfo?: SponsorInfo | null;
  /** Cloudinary'deki kapak fotoğrafı. */
  coverPhotoUrl?: string;
  /** Fotoğrafçı ve lisans, ör. "A.Savin · FAL" (lisans gereği gösterilir). */
  coverPhotoCredit?: string;
  /** Fotoğrafın kaynağı (Wikimedia Commons sayfası). */
  coverPhotoSource?: string;
};

export type WithId<T> = T & { id: string };
