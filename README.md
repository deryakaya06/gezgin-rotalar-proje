# Gezgin Rotalar

Çiftlerin ve arkadaş gruplarının İstanbul'da gezdikleri yerlerde check-in yapıp puan topladığı, birbirlerinin rotalarını takip ettiği mobil uygulama.

**Durum:** Sprint 0 (Kurulum ve Planlama) tamamlandı.

## Sprint 0'da kurulanlar

- Turborepo monoreposu: `apps/mobile`, `apps/web`, `packages/shared`, `packages/ui`
- Expo (React Native) mobil uygulaması ve Firebase bağlantısı
- Next.js admin paneli iskeleti
- GitHub Actions: her pull request'te lint, tip kontrolü ve Firestore kural testleri

## Yapı

| Klasör | İçerik |
|---|---|
| `apps/mobile` | Expo / React Native uygulaması (Expo Router) |
| `apps/web` | Admin paneli iskeleti (Next.js) |
| `packages/shared` | Mobil ve web'in ortak Firestore tipleri ve sabitleri |
| `packages/ui`, `packages/eslint-config`, `packages/typescript-config` | Ortak paketler (Turborepo) |
| `firestore.rules`, `firestore-tests` | Güvenlik kuralları ve emülatör testleri |
| `.github/workflows/ci.yml` | Her pull request'te lint, tip kontrolü ve kural testleri |

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
