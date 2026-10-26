# Sprint 0 ve Sprint 1 — Yapılanlar

## Sprint 0 — Kurulum ve Planlama

**Hedef:** geliştirme ortamını hazırlamak ve proje temellerini atmak.

| # | Plan maddesi | Durum | Nasıl yapıldı | Dosyalar |
|---|---|---|---|---|
| 1 | Geliştirme ortamı (Node.js, Expo CLI, VS Code) | ✅ | Node.js 24 ve npm 11; sürümler kök `package.json`'da tanımlı. Expo CLI `npx` ile çalışıyor. | `package.json` |
| 2 | Firebase projesi ve servisler | ✅ Auth, Firestore · ⚠️ Storage, Functions | Firebase projesi `gezgin-rotalar` (Firestore konumu `eur3`). Proje ücretsiz **Spark** planında kalacağı için Storage ve Functions bu planda kullanılamıyor; sunucu tarafı denetimler Firestore güvenlik kurallarıyla yapılıyor, fotoğraf saklama için ücretsiz bir alternatif (Cloudinary) Sprint 4'te değerlendirilecek. | `firebase.json`, `.firebaserc`, `apps/mobile/src/firebase*.ts`, `packages/shared/src/constants.ts` |
| 3 | UI/UX tasarımlarının Figma'da detaylandırılması | ⏳ | Görsel dil belirlendi: fildişi zemin, şişe yeşili ana renk, pirinç vurgu; başlıklar Playfair Display, metinler Manrope. Figma çalışması sürüyor. | `apps/mobile/src/constants/theme.ts` |
| 4 | Git deposu ve monorepo yapısı | ✅ | **Turborepo** + npm workspaces. Ortak ESLint ve TypeScript ayarları ayrı paketlerde; `packages/shared` mobil ve web'in ortak tiplerini tutuyor. | `package.json`, `turbo.json`, `apps/*`, `packages/*` |
| 5 | `create-expo-app` ile `apps/mobile` | ✅ | Expo SDK 57 + Expo Router. Şablondan kalan örnek bileşenler temizlendi; uygulama adı "Gezgin Rotalar". | `apps/mobile/package.json`, `app.json`, `tsconfig.json`, `assets/` |
| 6 | GitHub Actions CI (lint + test) | ✅ | Her pull request'te iki iş paralel çalışıyor: bütün paketlerde lint + tip kontrolü ve Firestore emülatöründe güvenlik kuralı testleri. | `.github/workflows/ci.yml` |

## Sprint 1 — Temel Kullanıcı Sistemi ve UI Altyapısı

**Hedef:** kullanıcıların hesap oluşturup giriş/çıkış yapabilmesi ve uygulamanın temel görsel altyapısının kurulması.

| # | Plan maddesi | Durum | Dosyalar (`apps/mobile/src/`) |
|---|---|---|---|
| 1 | Cihaz temasına göre değişen dinamik renk paleti | ✅ | `constants/theme.ts`, `hooks/use-theme.ts`, `hooks/use-color-scheme*.ts`, `components/themed-*.tsx`, `components/ui/*` |
| 2 | Expo Router ile Auth Stack ve Main Stack | ✅ | `app/_layout.tsx`, `app/(tabs)/_layout.tsx`, `components/app-tabs*.tsx` |
| 3 | Kayıt Ol ekranı | ✅ | `app/login.tsx` |
| 4 | Kayıt formunda "Çift" / "Arkadaşlar" seçimi | ✅ | `app/login.tsx` |
| 5 | Kullanıcıyı Firebase Auth'a ve `users` koleksiyonuna kaydetme | ✅ | `services/users.ts`, `firestore.rules`, `firestore-tests/` |
| 6 | Giriş Yap ekranı | ✅ | `app/login.tsx` |
| 7 | `onAuthStateChanged` ile oturum yönetimi | ✅ | `context/auth.tsx` |

### Dinamik renk paleti

- Bütün renkler `constants/theme.ts`'de açık ve koyu mod için ayrı ayrı tanımlı; ekranlar renkleri `useTheme()` ile okuyor, bileşenlerde sabit renk kodu yok.
- Cihaz koyu moda geçince uygulama yeniden başlamadan koyu palete geçiyor.
- Ortak bileşenler: `Button`, `Chip` (seçilebilir sekme), `TextField` (koyu modda da okunan metin kutusu), `Card`.
- Yazı tipleri (Playfair Display, Manrope) açılışta yükleniyor; yüklenemezse sistem yazısıyla devam ediliyor.

### Auth Stack ve Main Stack

`app/_layout.tsx` içinde Expo Router'ın `Stack.Protected` özelliğiyle iki grup var:

```tsx
<Stack.Protected guard={!!user}>   {/* Main Stack: sekmeler, hoş geldin ekranı */}
  <Stack.Screen name="(tabs)" />
  <Stack.Screen name="welcome" />
</Stack.Protected>
<Stack.Protected guard={!user}>    {/* Auth Stack */}
  <Stack.Screen name="login" />
</Stack.Protected>
```

- Giriş yapmamış kullanıcı yalnızca giriş ekranını görüyor; giriş yapınca ana sekmelere, çıkış yapınca giriş ekranına otomatik yönlendiriliyor.
- Oturum durumu ve yazı tipleri belli olana kadar açılış ekranı (splash) açık kalıyor.
- Ana yapıda 4 sekme var (Akış, Keşfet, Rotalar, Profil); Akış, Keşfet ve Rotalar sekmelerinde hangi sprintte geleceklerini anlatan yer tutucular bulunuyor.

### Kayıt ve giriş

- Kayıt ve giriş tek ekranda; alttaki bağlantıyla geçiş yapılıyor.
- **Kayıt alanları:** görünen ad (2–40 karakter, ör. "Ayşe & Mehmet"), e-posta, şifre (en az 6 karakter), hesap türü (💑 Çift / 👥 Arkadaşlar).
- **Akış:** Firebase Auth'ta hesap oluşturulur → `users/{uid}` profili yazılır → "Hoş geldin" ekranı açılır.
- Firebase hata kodları Türkçe mesajlara çevriliyor ("Email veya şifre hatalı.", "Bu email ile zaten bir hesap var." vb.).
- Klavye açılınca form yukarı kayıyor; gönderim sırasında düğme kilitleniyor; e-posta ve şifre alanları cihazın otomatik doldurma özelliğiyle çalışıyor.

### Veri modeli ve güvenlik

`users/{uid}` (`packages/shared/src/types.ts`):

| Alan | Açıklama |
|---|---|
| `displayName` | Görünen ad; diğer kullanıcılar bunu görür |
| `accountType` | `couple` veya `friends` |
| `totalPoints`, `visitCount` | Puan ve ziyaret sayısı (Sprint 4'te kullanılacak); kayıtta 0 |
| `createdAt` | Sunucu zamanı |

- **Gizlilik:** e-posta herkese açık profilde tutulmuyor; yalnızca Firebase Auth'ta.
- **Güvenlik kuralları** (`firestore.rules`):
  - kullanıcı yalnızca kendi profilini, bilinen alanlarla ve puanlar 0 iken oluşturabiliyor;
  - sonradan yalnızca görünen adını ve hesap türünü değiştirebiliyor; puanını doğrudan yazamıyor;
  - profiller silinemiyor;
  - giriş yapmamış biri hiçbir şey okuyamıyor;
  - kuralı olmayan her koleksiyon kapalı.

### Oturum yönetimi

`context/auth.tsx` içindeki `AuthProvider`:

- `onAuthStateChanged` ile oturumu dinliyor; giriş, çıkış ve uygulama yeniden açılınca kayıtlı oturum otomatik algılanıyor.
- Kullanıcının profil dokümanını canlı dinliyor (`onSnapshot`); profil değişince ekranlar anında güncelleniyor.
- Oturum mobilde cihazda (`AsyncStorage`), web'de tarayıcıda saklanıyor.
- Bütün ekranlar oturuma tek yerden erişiyor: `const { user, profile } = useAuth()`.
- Profil sekmesi hesap bilgilerini, üyelik tarihini, o anki temayı ve oturum durumunu gösteriyor.

## Test ve doğrulama

**Güvenlik kuralı testleri** (`firestore-tests/rules.test.mjs`) Firebase emülatöründe çalışıyor; 9 testin hepsi geçiyor:

- ✔ kullanıcı kendi profilini oluşturabilir (çift ve arkadaş hesabı)
- ✔ sıfırdan farklı puanla profil oluşturulamaz
- ✔ başkasının profili oluşturulamaz
- ✔ geçersiz ad, hesap türü veya fazladan alan reddedilir (rol verme, profilde e-posta)
- ✔ görünen ad ve hesap türü değiştirilebilir
- ✔ puan doğrudan değiştirilemez
- ✔ başkasının profili değiştirilemez ve profil silinemez
- ✔ giriş yapmış kullanıcı profilleri okuyabilir, giriş yapmamış okuyamaz
- ✔ kuralı olmayan koleksiyonlar kapalıdır

**CI:** her pull request'te lint, TypeScript tip kontrolü ve kural testleri GitHub Actions'ta çalışıyor.

## Demo senaryosu (5–7 dakika)

1. **Sprint 0:** depo yapısı (`apps/`, `packages/`, `turbo.json`) ve GitHub **Actions** sekmesindeki yeşil CI çalışmaları.
2. **Kayıt:** uygulama açılınca giriş ekranı gelir. Görünen ad, e-posta, şifre ve **Çift** seçimiyle kayıt ol; hoş geldin ekranında ad görünür.
3. **Hata mesajı:** çıkış yapıp yanlış şifreyle giriş dene → "Email veya şifre hatalı."
4. **Giriş ve ana yapı:** dört sekme; ilk üçünde sonraki sprintlerin yer tutucusu.
5. **Profil:** hesap türü, e-posta, üyelik tarihi, tema ve oturum bilgisi.
6. **Oturum:** uygulamayı kapatıp aç; tekrar giriş istenmez.
7. **Tema:** cihazı koyu moda al; uygulama anında koyu palete geçer.
8. **Güvenlik:** `firestore.rules` ve testleri.
