# VanYouthClub

Van'ın gençlerini sosyal, kültürel, sportif ve topluluk odaklı etkinliklerde
buluşturan modern web platformu. Public etkinlik sitesi + yönetim paneli.

## Teknoloji

| Katman | Teknoloji |
|---|---|
| Framework | Next.js 15 (App Router) |
| Dil | TypeScript (strict) |
| UI | React 19 + Tailwind CSS 3 |
| Veritabanı | PostgreSQL 16+ |
| ORM / Migration | Drizzle ORM + drizzle-kit |
| Doğrulama | Zod |
| Şifre hashleme | Argon2id (`@node-rs/argon2`) |
| Font | Inter (self-hosted, `@fontsource-variable/inter`) |

## Özellikler

**Public site**
- Ana sayfa (hero, yaklaşan etkinlikler, kategoriler, hakkımızda, galeri, iletişim)
- Etkinlik listesi + kategori filtresi
- Etkinlik detay sayfası (tarih, saat, konum, kapasite, katılım/iletişim)
- Galeri (lightbox'lı)
- Hakkımızda / İletişim (tel:, WhatsApp, Instagram bağlantıları)
- SEO: metadata, Open Graph, sitemap.xml, robots.txt, favicon
- Responsive (mobile-first), erişilebilirlik (skip-link, focus state, alt metin)

**Yönetim paneli (`/admin`)**
- Session-based admin girişi (httpOnly cookie, sunucu tarafı oturum)
- Dashboard istatistikleri
- Etkinlik CRUD + yayın durumu (Taslak / Yayında / Tamamlandı / İptal)
- Kategori yönetimi (ekle, düzenle, aktif/pasif, sıralama)
- Galeri yönetimi (güvenli dosya yükleme, silme)
- Site ayarları (başlık, açıklama, Instagram, telefonlar)
- Audit log (tüm önemli yönetim işlemleri)

## Local Development

### Gereksinimler

- Node.js 20+
- PostgreSQL 16+ (lokalde kurulu veya Docker)

### Kurulum

```bash
# 1. Bağımlılıklar
npm install

# 2. Environment
cp .env.example .env
# .env içindeki DATABASE_URL değerini kendi PostgreSQL bilgilerinize göre düzenleyin

# 3. Veritabanı (development)
npm run db:migrate     # migration'ları uygular (drizzle-kit migrate)

# 4. Seed (opsiyonel — kategoriler, ayarlar, ilk yönetici, örnek etkinlikler)
npm run db:seed

# 5. Geliştirme sunucusu
npm run dev            # http://localhost:3000
```

## Environment Variables

| Değişken | Açıklama | Örnek |
|---|---|---|
| `DATABASE_URL` | PostgreSQL bağlantı string'i | `postgresql://user:pass@localhost:5432/vanyouthclub_dev?schema=public` |
| `ADMIN_EMAIL` | Seed ile oluşturulacak yönetici e-postası | `admin@example.com` |
| `ADMIN_PASSWORD` | Seed yönetici şifresi (min. 8 karakter) | — |
| `APP_ENV` | Ortam | `development` / `production` |
| `FRONTEND_URL` | Site URL'i (SEO/canonical) | `http://localhost:3000` |

Gerçek credential'lar **asla** Git'e commit edilmez; `.env` dosyası
`.gitignore` içindedir.

## Database

- Şema tanımı: `src/lib/db/schema.ts`
- Migration'lar: `drizzle/` klasörü (SQL olarak üretilir, geri izlenebilir)
- Yeni migration oluşturma: `npm run db:generate`
- Migration uygulama: `npm run db:migrate`
- Tablolar: `admins`, `admin_sessions`, `categories`, `events`,
  `gallery_images`, `site_settings`, `audit_logs`
- Tasarım referansı: `docs/DATABASE_PLAN.md`

Migration'ları production'a uygulamadan önce üretilen SQL dosyasını inceleyin.
Prisma/drizzle `migrate reset` gibi destructive komutlar **yalnızca** lokal
development veritabanında kullanılmalıdır.

## Admin Girişi

Seed çalıştırıldıysa (`.env` içindeki bilgilerle):

```
URL:      /admin/login
E-posta:  .env dosyasındaki ADMIN_EMAIL
Şifre:    .env dosyasındaki ADMIN_PASSWORD
```

Production'da ilk girişten sonra şifreyi mutlaka değiştirin. Oturumlar
sunucu tarafında tutulur; çıkış yapıldığında anında geçersiz olur.

## Build / Production

```bash
npm run build      # production build
npm run start      # production sunucusu
```

Üretim dağıtımı için:

1. `APP_ENV=production` ve production `DATABASE_URL` tanımlayın
2. `npm run db:migrate` ile migration'ları uygulayın
3. Yönetici hesabını güvenli bir şifre ile oluşturun/güncelleyin
4. `npm run build && npm run start`

## Scriptler

| Komut | Açıklama |
|---|---|
| `npm run dev` | Geliştirme sunucusu |
| `npm run build` | Production build |
| `npm run start` | Production sunucusu |
| `npm run lint` | ESLint |
| `npm run typecheck` | TypeScript kontrolü |
| `npm run db:generate` | Migration SQL'i üret |
| `npm run db:migrate` | Migration'ları uygula |
| `npm run db:seed` | Seed verisi |
| `npm run db:studio` | Drizzle Studio (DB görüntüleme) |

## Güvenlik Notları

- Şifreler Argon2id ile hash'lenir; düz metin saklanmaz
- Oturum token'ları SHA-256 hash'i olarak saklanır; cookie `httpOnly`
  (production'da `Secure`) + `SameSite=Lax`
- Admin API'lerinde origin kontrolü (CSRF), authentication ve authorization
- Login'de rate limiting (5 deneme / 15 dakika)
- Dosya yüklemelerinde tip (magic byte), boyut (5 MB) ve dosya adı doğrulaması
- Tüm sorgular parametrik (SQL injection koruması)
- Public sayfalarda teknik hata detayı gösterilmez

## Proje Yapısı

```
src/
  app/                  # Next.js App Router
    (auth)/admin/login  # Giriş sayfası (guard dışında)
    admin/              # Yönetim paneli (session guard'lı layout)
    api/admin/          # Admin API route'ları
    events/             # Etkinlik listesi + detay
    gallery/ about/ contact/
  components/           # UI bileşenleri (public + admin)
  lib/
    db/                 # Drizzle şeması, bağlantı, seed
    auth.ts             # Session yönetimi
    queries.ts          # Tüm veritabanı sorguları
    settings.ts         # Site ayarları
    validation.ts       # Zod şemaları
    upload.ts           # Güvenli dosya yükleme
    audit.ts            # Audit log
drizzle/                # Migration dosyaları
docs/                   # Proje dokümantasyonu
```

## İletişim

- Telefon: 0536 426 19 30 / 0544 167 00 96
- Instagram: [@vanyouthclub](https://www.instagram.com/vanyouthclub/)
