# Gezgin Rotalar

Çiftlerin ve arkadaş gruplarının İstanbul'da gezdikleri yerlerde check-in yapıp puan topladığı, birbirlerinin rotalarını takip ettiği mobil uygulama.

**Durum:** Sprint 0, 1, 2 ve 3 tamamlandı.

| Sprint | Konu | Rapor |
|---|---|---|
| 0 | Kurulum ve Planlama | [docs/sprint-0-1.md](docs/sprint-0-1.md) |
| 1 | Temel Kullanıcı Sistemi ve UI Altyapısı | [docs/sprint-0-1.md](docs/sprint-0-1.md) |
| 2 | Profil ve Takip Sistemi | [docs/sprint-2.md](docs/sprint-2.md) |
| 3 | Keşfet, Mekanlar ve Harita | [docs/sprint-3.md](docs/sprint-3.md) |

## Özellikler

**Sprint 1**

- E-posta ve şifreyle kayıt olma; hesap türü seçimi (**Çift** / **Arkadaşlar**)
- Giriş, çıkış ve oturumun korunması (uygulama kapatılıp açılsa da)
- Giriş yapmamış kullanıcıyı giriş ekranına, yapmış olanı ana sayfaya yönlendirme
- Cihaz temasına göre değişen açık / koyu renk paleti
- 4 sekmeli ana yapı: Akış, Keşfet, Rotalar, Profil (ilk üçü sonraki sprintlerde doldurulacak)
- Firestore güvenlik kuralları ve otomatik testleri

**Sprint 2**

- Kullanıcı arama (görünen adla, Türkçe karakter ve büyük/küçük harf duyarsız)
- Başka kullanıcıların profil sayfası
- Takip et / takibi bırak; takipçi ve takip sayıları
- Takipçiler ve Takip Edilenler listeleri

**Sprint 3**

- Keşfet ekranı: kapak fotoğraflı 29 mekan, sponsorlu mekanlar en üstte
- Mekan arama; puan, ücretsiz giriş ve ilçe filtreleri
- Liste ve harita görünümü
- Mekan detay sayfası ve yol tarifi

## Yapı

| Klasör | İçerik |
|---|---|
| `apps/mobile` | Expo / React Native uygulaması (Expo Router) |
| `apps/web` | Admin paneli iskeleti (Next.js) |
| `packages/shared` | Mobil ve web'in ortak Firestore tipleri ve sabitleri |
| `packages/ui`, `packages/eslint-config`, `packages/typescript-config` | Ortak paketler (Turborepo) |
| `firestore.rules`, `firestore-tests` | Güvenlik kuralları ve emülatör testleri |
| `.github/workflows/ci.yml` | Her pull request'te lint, tip kontrolü ve kural testleri |
| `docs` | Sprint raporları |

## Başlangıç

Gereksinimler: Node.js 24+, npm 11. Kural testleri için Java.

```sh
npm install
cd apps/mobile && npx expo start
```

Telefondaki **Expo Go** uygulamasıyla terminaldeki QR kodu okut (telefon ve bilgisayar aynı Wi-Fi ağında olmalı; olmazsa `npx expo start --tunnel`).

## Kontroller

```sh
npx turbo run lint check-types              # lint + tip kontrolü
cd firestore-tests && npm install && npm test   # güvenlik kuralı testleri (emülatörde)
```

## Web sürümü

```sh
npm run web:deploy   # mobil uygulamanın web hâlini derler ve Firebase Hosting'e yükler
```

> **Not:** `firestore.rules` bu depoda emülatör testleri için tutulur ve buradan Firebase'e yayınlanmaz. Bu yüzden bu depodan `firebase deploy --only firestore` çalıştırılmamalı; web yayınlama komutu (`--only hosting`) yalnızca web sitesini günceller.
