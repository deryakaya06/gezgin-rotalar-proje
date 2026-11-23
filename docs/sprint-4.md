# Sprint 4 — Check-in ve Oyunlaştırma

**Süre:** 17.11.2026 – 30.11.2026

**Hedef:** kullanıcıların bir mekanı ziyaret edip puan kazanabilmesi.

| # | Plan maddesi | Durum | Dosyalar (`apps/mobile/src/`) |
|---|---|---|---|
| 1 | Mekan detayında check-in akışı | ✅ | `app/location/[id].tsx` |
| 2 | Kamera veya galeriden fotoğraf seçme (`expo-image-picker`) | ✅ | `components/photo-picker.tsx`, `services/photos.ts` |
| 3 | Fotoğrafın yüklenmesi | ✅ Cloudinary | `services/photos.ts` |
| 4 | `check_ins` koleksiyonuna ziyaret kaydı | ✅ | `services/checkins.ts` |
| 5 | `totalPoints` ve `visitCount` güncellemesi | ✅ Batch + güvenlik kuralları | `services/checkins.ts`, `firestore.rules` |
| 6 | Liderlik Tablosu | ✅ | `app/leaderboard.tsx` |

## Plandan farklı yapılan iki karar

Proje ücretsiz **Spark** planında kaldığı için Firebase Storage ve Cloud Functions kullanılamıyor:

- **Fotoğraflar Cloudinary'de.** Fotoğraf yüklemeden önce en fazla 1600 px'e küçültülüp sıkıştırılıyor. Listelerde tam boy yerine küçük kopya indiriliyor.
- **Puanı Cloud Function yerine güvenlik kuralları koruyor.** Check-in, puan ve ziyaret kaydı **tek batch'te** yazılır. `firestore.rules` bu üçünün tutarlı olduğunu sunucuda doğrular; kullanıcı uygulamayı atlatsa bile kendine puan yazamaz.

## Veri modeli

```
check_ins/{id}                  userId, locationId, locationName, note, points, photoUrl?, createdAt
users/{uid}                     totalPoints, visitCount, lastCheckInId
users/{uid}/visits/{locationId} lastAwardedAt, checkInId
```

## Puan kuralları

- Her check-in **10 puan** kazandırır.
- Aynı mekanda **24 saat içinde** tekrar check-in yapılabilir ama puan verilmez.
- Rozetler check-in sayısına göre kazanılır: **İlk Adım** (1), **Kaşif** (5), **Rota Ustası** (10).

## Güvenlik kuralları

- Kişi yalnızca kendi adına check-in yapabilir; mekan gerçekten var olmalı ve adı eşleşmeli.
- Puan yalnızca 0 ya da 10 olabilir; 10 ise aynı batch'te `visits` kaydı güncellenmiş olmalı.
- `totalPoints` yalnızca yeni check-in'in puanı kadar, `visitCount` yalnızca 1 artabilir.
- Aynı check-in ile iki kez puan toplanamaz.
- Fotoğraf adresi yalnızca projenin Cloudinary hesabından olabilir.

## Test ve doğrulama

`firestore-tests/rules.test.mjs`: **31 testin hepsi geçiyor** (Sprint 4'te 10 yeni). Lint ve tip kontrolü temiz; uygulama iOS ve web için derleniyor.

## Demo senaryosu (6 dakika)

1. **Keşfet**'ten bir mekana gir, aşağı kaydır.
2. **Galeriden Seç** ile fotoğraf ekle, kısa bir not yaz, **Check-in Yap**. "+10 puan kazandın" mesajı çıkar.
3. Aynı mekanda tekrar check-in yap: kayıt olur ama puan verilmez (24 saat kuralı).
4. **Rotalar** sekmesinde check-in'i ve fotoğrafı göster.
5. **Profil**'de puan, check-in sayısı ve **İlk Adım** rozetini göster.
6. **Lider Tablosunu Gör** ile sıralamayı aç.
7. `firestore.rules` içindeki `isCheckInCounterUpdate` kuralını ve testleri göster.
