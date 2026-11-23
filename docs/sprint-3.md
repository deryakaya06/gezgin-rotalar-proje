# Sprint 3 — Keşfet, Mekanlar ve Harita Altyapısı

**Süre:** 03.11.2026 – 16.11.2026

**Hedef:** kullanıcıların gezilecek yerleri görüp arayabilmesi ve rota özelliğinin veri temelinin atılması.

| # | Plan maddesi | Durum | Dosyalar |
|---|---|---|---|
| 1 | `locations` koleksiyonuna 20–30 mekan eklenmesi | ✅ 29 mekan | Firestore `locations` |
| 2 | Şemaya `isSponsored` ve `sponsorInfo` alanları | ✅ | `packages/shared/src/types.ts`, `firestore.rules` |
| 3 | Keşfet ekranı | ✅ | `apps/mobile/src/app/(tabs)/explore.tsx` |
| 4 | Mekanların liste halinde gösterilmesi | ✅ | `explore.tsx`, `services/locations.ts` |
| 5 | Mekan arama ve filtreleme | ✅ | `explore.tsx`, `services/locations.ts` |
| 6 | Mekan Detay ekranı | ✅ | `apps/mobile/src/app/location/[id].tsx` |
| 7 | Harita ekranı | ✅ `react-native-maps`, web'de Leaflet | `components/location-map*.tsx` |

## Ekranlar

- **Keşfet:** kapak fotoğraflı mekan kartları; sponsorlu mekanlar en üstte ve etiketli.
- **Arama:** mekan adı, ilçe veya kategoriye göre, yazdıkça süzülür.
- **Filtreler:** Tümü, Yüksek Puanlı (4.5+), Ücretsiz Giriş ve ilçe seçimi. Filtreler birlikte çalışır.
- **Liste / Harita:** aynı sonuçlar harita üzerinde işaretçi olarak görülebilir; işaretçiden detaya geçilir.
- **Mekan detayı:** kapak fotoğrafı (kaydırınca parallax), açıklama, puan, kategori, küçük harita ve **Yol Tarifi Al**.

## Teknik kararlar

- **Harita:** planda Mapbox da geçiyordu. Mapbox ücretli hesap ve özel derleme gerektirdiği için telefonda `react-native-maps`, web'de ücretsiz **Leaflet + OpenStreetMap** kullanıldı.
- **Fotoğraflar:** kapak fotoğrafları Wikimedia Commons'tan alındı, Cloudinary'de tutuluyor; fotoğrafçı ve lisans detay ekranında yazıyor.
- **Arayüz:** bu sprintle birlikte uygulama pastel tasarıma geçti (krem, adaçayı yeşili, pudra pembe; Lora ve Nunito).

## Güvenlik kuralları

- Mekanları giriş yapmış herkes okuyabilir; **yalnızca admin** ekleyip değiştirebilir.
- Admin rolü yalnızca Firebase Console'dan verilebilir; kullanıcı kendine rol yazamaz.
- Mekan verisi doğrulanır: bilinmeyen alan, geçersiz koordinat, 0–5 dışı puan reddedilir.
- Kapak fotoğrafı yalnızca projenin Cloudinary hesabından olabilir.

## Test ve doğrulama

`firestore-tests/rules.test.mjs`: **21 testin hepsi geçiyor** (Sprint 3'te 5 yeni). Lint ve tip kontrolü temiz; uygulama iOS ve web için derleniyor.

## Demo senaryosu (5 dakika)

1. **Keşfet** sekmesini aç; mekan kartlarını göster.
2. Arama kutusuna `kadıköy` yaz; sonuçlar süzülür. Temizleyip **Ücretsiz Giriş** filtresini seç.
3. **Harita**'ya geç, bir işaretçiye ve açılan balona dokunarak mekan detayına gir.
4. Detayda kaydırarak kapak efektini, küçük haritayı ve **Yol Tarifi Al**'ı göster.
5. `firestore.rules` içindeki `locations` kuralını ve testleri göster.
