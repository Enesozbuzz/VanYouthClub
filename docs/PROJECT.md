# VanYouthClub — Project Specification

## 1. Project Identity

Project Name: VanYouthClub

Brand Name: VAN YOUTH CLUB

Project Type: Youth and community event platform

Primary Language: Turkish

Current Phase: **Implementation — public website + admin panel delivered**

---

## 2. Current Scope (Implemented)

Aşağıdaki sistemler bu fazda uygulanmıştır:

- Next.js 15 (App Router) + TypeScript uygulaması
- PostgreSQL + Drizzle ORM (migration tabanlı)
- Public website: ana sayfa, etkinlikler (filtre + detay), hakkımızda,
  galeri, iletişim
- Admin panel: login, dashboard, etkinlik CRUD, kategori yönetimi,
  galeri yönetimi, site ayarları
- Session-based admin authentication (httpOnly cookie, server-side session)
- Audit log (yönetim işlemleri)
- SEO temelleri: metadata, Open Graph, sitemap.xml, robots.txt, favicon

Bilerek **uygulanmayan** sistemler (üstünkörü kapsam genişletmesi yapılmadı):

- Online ödeme / rezervasyon sistemi
- Public kullanıcı üyelik sistemi
- E-posta / push bildirim
- CMS (tam içerik yönetimi)
- Gerçek zamanlı mesajlaşma, AI asistan, analitik platformu
- Cloud storage (galeri local dosya sistemi ile çalışır)

Bu özellikler açık bir ürün gereksinimi olmadıkça eklenmemelidir.

---

## 3. Product Direction

Platform, Van'daki gençlerin etkinlikleri keşfetmesini, etkinlik detaylarını
görmesini ve katılım/iletişim kurmasını sağlar.

- Public event discovery ✓
- Event categories ✓ (veritabanı tablosu, admin yönetimli)
- Event detail pages ✓
- Event participation/contact flows ✓ (telefon / WhatsApp)
- Gallery ✓
- Social media integration ✓ (Instagram)
- Contact information ✓
- Administrative content management ✓
- Secure administrator authentication ✓
- Event CRUD operations ✓

---

## 4. Event Categories

Veritabanında tutulur (`categories` tablosu), admin panelinden yönetilir:

- Kamp
- Game Night
- Akustik
- Gezi
- Kahve & Tanışma
- Açık Hava Sineması
- Doğa & Spor
- Atölye & Sanat

---

## 5. Brand and UX Direction

Uygulanan görsel dil:

- Dark / charcoal zemin (`#08080A` – `#1F1F26`)
- Neon yellow (`#E2FF3D`), orange, vibrant purple, electric blue vurgular
- Hafif glassmorphism (abartılmadan)
- Inter fontu
- Mobile-first responsive tasarım

---

## 6. Contact and Social Information

Phone: 0536 426 19 30 / 0544 167 00 96
Instagram: https://www.instagram.com/vanyouthclub/

Telefon bağlantıları `tel:`, mesaj bağlantıları `https://wa.me/90...`
formatında üretilir (`src/lib/settings.ts`).

---

## 7. Security Rules (Active)

Never commit:

- API keys
- Passwords
- JWT secrets
- Database credentials
- Private certificates
- Production environment variables

Real environment values remain outside Git (`.env`, `.gitignore` kapsamında).
`.env.example` yalnızca örnek değerler içerir.

Uygulanan güvenlik kontrolleri:

- Argon2id şifre hashleme
- Sunucu tarafı session'lar (token hash'i DB'de; httpOnly cookie)
- Origin kontrolü (CSRF), authentication + authorization (her admin API'de)
- Login rate limiting (5 deneme / 15 dk)
- Güvenli dosya yükleme (magic byte, boyut, rastgele ad)
- Parametrik sorgular (SQL injection koruması)
- Public hata sayfalarında teknik detay gösterilmez

---

## 8. Database Rule (Active)

Veritabanı teknolojisi, şema, migration ve güvenlik gereksinimleri
`docs/DATABASE_PLAN.md` içinde dokümante edilmiştir.

Never:

- DROP DATABASE
- DROP TABLE
- TRUNCATE production data
- Delete migrations
- Reset a production database
- Modify production data destructively

without explicit approval.

---

## 9. AI Coding Agent Rules

Before making substantial changes:

1. Inspect the actual repository structure.
2. Read the relevant documentation.
3. Understand the current project phase.
4. Avoid assuming frameworks or technologies that have not been selected.
5. Make the smallest safe change required.
6. Validate changed files.
7. Run appropriate tests/build checks when available.
8. Report exactly what was changed.
9. Report validation results.
10. Avoid unrelated refactoring.

The agent must not invent files, folders, APIs, database schemas or
dependencies without establishing that they are required.

---

## 10. Repository Boundary

This repository is exclusively for VanYouthClub.

Do not copy, modify, merge or depend on unrelated projects.

In particular, existing KresPlatform projects are separate projects and must
remain untouched.

---

## 11. Development Philosophy

Proje kontrollü fazlarda ilerler. Her fazda:

- Net kapsam
- Implementasyon
- Doğrulama (lint / typecheck / build / migration)
- Güvenlik kontrolü
- Dokümantasyon güncellemesi
- Git commit

Mimari başlangıçta basit tutulur; gerçek ürün gereksinimi ortaya çıktıkça
sofistikeleşir.

---

## 12. Current Milestone

Milestone: **Production-ready website + admin panel**

Acceptance criteria:

- [x] Public website çalışıyor (ana sayfa, etkinlikler, detay, galeri, iletişim)
- [x] Responsive ve mobile-first tasarım
- [x] PostgreSQL şeması ve migration'lar uygulandı
- [x] Seed verisi (kategoriler, ayarlar, yönetici, örnek içerik)
- [x] Admin login + session güvenliği
- [x] Etkinlik / kategori / galeri / ayar yönetimi
- [x] Audit log
- [x] Yetkisiz erişim engellendi
- [x] Lint, typecheck ve build başarılı
- [x] README ve dokümanlar güncel
