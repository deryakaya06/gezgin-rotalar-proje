# Sprint 2 — Profil ve Takip Sistemi

**Süre:** 27.10.2026 – 02.11.2026

**Hedef:** kullanıcıların birbirini bulup takip edebilmesi; profillerde takipçi ve takip sayılarının görünmesi.

| # | Plan maddesi | Durum | Dosyalar (`apps/mobile/src/`) |
|---|---|---|---|
| 1 | Profil ekranı: kullanıcı bilgileri, takipçi / takip sayıları | ✅ | `app/(tabs)/profile.tsx`, `components/profile-summary.tsx`, `components/avatar.tsx` |
| 2 | Başka bir kullanıcının profil sayfası | ✅ | `app/user/[id].tsx` |
| 3 | Takip et / takibi bırak | ✅ | `services/follows.ts`, `hooks/use-follow.ts`, `components/follow-button.tsx` |
| 4 | `followers` / `following` alt koleksiyonları ve sayılar | ✅ | `services/follows.ts`, `hooks/use-follow-counts.ts`, `firestore.rules` |
| 5 | Takipçi ve takip edilen listeleri | ✅ | `app/follows.tsx`, `components/user-row.tsx` |
| 6 | Takip edilecek kişiyi bulmak için kullanıcı arama | ✅ | `app/search.tsx`, `services/users.ts`, `packages/shared/src/search.ts` |

## Veri modeli

Takip ilişkisi iki tarafta da tutulur:

```
users/{ben}/following/{hedef}     { createdAt }
users/{hedef}/followers/{ben}     { createdAt }
```

- İki kayıt **tek bir batch'te** (hepsi ya da hiçbiri) yazılır ve silinir; böylece "A, B'yi takip ediyor ama B'nin takipçilerinde A yok" gibi tutarsız bir durum oluşamaz.
- **Sayılar alan olarak tutulmaz.** Takipçi ve takip sayıları Firestore'un `count()` sorgusuyla alt koleksiyonlardan hesaplanır. Böylece sayaç ile gerçek liste hiçbir zaman ayrışmaz. Ücretsiz planda her 1000 kayıt 1 okuma sayılır.
- Kullanıcı araması için profile `searchName` alanı eklendi: görünen adın küçük harfli, Türkçe karakterleri sadeleştirilmiş hâli (`"Ayşe & Mehmet"` → `"ayse & mehmet"`). Firestore metin içinde arama yapamadığı için arama "şununla başlayanlar" sorgusuyla bu alanda yapılır.
- Sprint 1'de açılmış hesaplarda `searchName` yoktu; bu hesaplar ilk girişte otomatik olarak aramaya eklenir (`context/auth.tsx`).

## Ekranlar

- **Profil sekmesi:** profil kartında takipçi ve takip sayıları var; sayılara dokununca liste açılır. "Gezgin Ara" düğmesi arama ekranını açar.
- **Gezgin Ara:** görünen adla arama yapılır. Yazmayı bitirince 300 ms sonra sorgu atılır, her tuşa basışta değil. Sonuçlarda her satırda "Takip Et" düğmesi bulunur.
- **Kullanıcı profili** (`/user/[id]`): ad, hesap türü, takipçi/takip sayıları ve büyük "Takip Et / Takip Ediliyor" düğmesi. Takip edilince takipçi sayısı hemen güncellenir.
- **Takipçiler / Takip Edilenler:** iki sekmeli liste; satıra dokununca o kişinin profili açılır.
- Kişi kendi satırında takip düğmesi görmez ve kendi satırına dokununca kendi profil sekmesine gider.

## Güvenlik kuralları

`firestore.rules` içinde takip için:

- Kullanıcı yalnızca **kendi adına** takip edebilir; başkası adına takipçi ekleyemez.
- `following` kaydı ancak karşı taraftaki `followers` kaydı **aynı batch'te** oluşuyorsa yazılabilir. Silmede de durum aynı: iki taraf birlikte silinmeli.
- Kendini takip etmek ve var olmayan bir kullanıcıyı takip etmek reddedilir.
- Takip kaydında `createdAt` dışında alan olamaz, `createdAt` de sunucu zamanı olmak zorunda.
- `searchName` en fazla 60 karakter olabilir ve yalnızca profil sahibi değiştirebilir.

## Test ve doğrulama

`firestore-tests/rules.test.mjs`: **16 testin hepsi geçiyor** (Sprint 1'den 9 + Sprint 2'de 7 yeni):

- ✔ takip et / bırak iki tarafı birlikte günceller ve `count()` doğru sayar
- ✔ tek taraflı takip kaydı yazılamaz
- ✔ takip bırakılırken tek taraf silinemez
- ✔ başkası adına takipçi eklenemez; kişi kendini ve olmayan kullanıcıyı takip edemez
- ✔ profil arama alanıyla oluşturulur ve sahibi güncelleyebilir
- ✔ çok uzun arama alanı reddedilir; başkasının arama alanı değiştirilemez
- ✔ "ay" ile başlayan arama alanları bulunur

Lint ve tip kontrolü temiz; uygulama iOS ve web için derleniyor.

## Demo senaryosu (5 dakika)

1. İki hesap hazırla (ör. telefonda **Ayşe & Mehmet**, web sürümünde **Kadıköy Gezginleri**).
2. Telefonda **Profil → Gezgin Ara**: "kad" yaz; Kadıköy Gezginleri listelenir. Türkçe karakterle ("kadı") ya da büyük harfle yazınca da bulunur.
3. Sonuca dokun → kullanıcı profili açılır → **Takip Et**. Düğme "Takip Ediliyor" olur, takipçi sayısı 1'e çıkar.
4. Web sürümünde Kadıköy Gezginleri'nin profilinde **1 takipçi** görünür; sayıya dokununca Ayşe & Mehmet listelenir.
5. Telefonda **Takip Ediliyor**'a basarak takibi bırak; iki taraftaki sayılar 0'a döner.
6. `firestore.rules` içindeki `following` / `followers` kurallarını ve testleri göster.
