# VanYouthClub — Database Change Plan

> Status: **DOCUMENTATION ONLY**
> Schema / migration / ORM implementation: **BLOCKED — pending backend & ORM decision**
> Last updated: 2026-09-28

Bu doküman, VanYouthClub'a veritabanı eklenmeden önce hazırlanan resmi plandır
(`docs/PROJECT.md` §8 "Database Rule" gereğidir). Aşağıdaki kararlar kullanıcı
onayıyla sabitlenmiştir:

| Karar | Değer | Durum |
|---|---|---|
| Database teknolojisi | PostgreSQL 16+ | ✅ Onaylandı |
| ORM / data-access | Prisma **veya** EF Core | ⏳ Backend stack kararına bağlı — ertelendi |
| Backend stack | Next.js (öneri) / .NET / diğer | ⏳ Ertelendi |
| Auth modeli | Sunucu tarafı oturum (httpOnly cookie) | ✅ Onaylandı |
| Kategori yapısı | `categories` tablosu | ✅ Onaylandı |

---

## 1. Mevcut Durum (Discovery)

Repository şu anda **repository foundation** fazındadır:

- Mevcut dosyalar: `README.md`, `docs/PROJECT.md`, `.env.example`, `.gitignore`
- Frontend framework: **yok**
- Backend framework: **yok**
- Database / ORM / migration: **yok**
- Mevcut production veritabanı: **yok** (greenfield — korunacak veri riski sıfır)
- `.gitignore`: Node ekosistemine işaret ediyor (`node_modules/`, `.next/`, `.nuxt/`) ancak bu bir seçim değildir
- `.env.example`: `DATABASE_URL` ve `JWT_SECRET` yorum satırı placeholder'ları; gerçek secret yok
- Git: `arena/01a0e8b4-vanyouthclub` branch'i, origin `Enesozbuzz/VanYouthClub`

**Neden database gerekli?** Planlanan ürün yetenekleri (etkinlik CRUD, kategori
yönetimi, galeri, site ayarları, güvenli yönetici girişi, yönetim paneli)
kalıcı, ilişkisel ve sorgulanabilir depolama gerektirir. "Yaklaşan etkinlikleri
listeleme", "taslak/yayında durumu", "kapasite", "yönetici işlem denetimi"
gibi gereksinimler statik içerik yaklaşımıyla karşılanamaz.

---

## 2. DATABASE CHANGE PLAN

### 2.1 Kullanılacak database

**PostgreSQL 16+**

Gerekçe:

- Veri tamamen ilişkisel (event ↔ kategori ↔ yönetici); FK bütünlüğü gerekli
- `timestamptz` ile Europe/Istanbul saat dilimi ve DST doğruluğu
- JSONB: `site_settings` ve `audit_logs.metadata` için uygun
- Partial index, olgun ekosistem, ücretsiz, ölçeklenebilir

Elendiler: SQLite (eşzamanlı production zayıf), MongoDB (ilişkisel bütünlük
zayıf), MySQL (PostgreSQL özellikleri karşısında geride).

### 2.2 ORM / data-access

**Ertelendi.** Backend stack kararı verildiğinde:

- Node/TypeScript → **Prisma** (öneri): schema-as-code, tip güvenli client,
  yerleşik migration, SQL injection'a kapalı parametrik sorgular
- .NET → **EF Core**: database PostgreSQL kalır, migration'lar EF Core ile üretilir

Bağlantı yaklaşımı: connection string yalnızca environment variable'dan
(`DATABASE_URL`), git'e commit edilmez. İleride pooler kullanılırsa migration'lar
için ayrı `DIRECT_URL` eklenir (şimdilik gerekmiyor).

### 2.3 Yeni tablolar (Faz 1 — 7 tablo)

**1. `admins`** — yönetici hesapları

| Kolon | Tip | Not |
|---|---|---|
| id | uuid PK | `gen_random_uuid()` |
| email | citext/text UNIQUE NOT NULL | lowercase normalize |
| password_hash | text NOT NULL | Argon2id; düz metin yasak |
| full_name | text NOT NULL | |
| role | text/enum NOT NULL | `ADMIN` \| `SUPER_ADMIN` |
| is_active | boolean NOT NULL DEFAULT true | hesap devre dışı bırakma (soft delete yerine) |
| last_login_at | timestamptz NULL | |
| created_at / updated_at | timestamptz NOT NULL | |

Public kullanıcı tablosu (`users`) **tasarlanmıyor**: üründe public üyelik
gereksinimi yok; auth sistemi netleşmeden kullanıcı tablosu varsayımla
oluşturulmaz.

**2. `admin_sessions`** — sunucu tarafı oturumlar (onaylanan auth modeli)

| Kolon | Tip | Not |
|---|---|---|
| id | uuid PK | |
| admin_id | uuid FK → admins.id ON DELETE CASCADE | index |
| token_hash | text UNIQUE NOT NULL | 256-bit token'ın SHA-256 hash'i; raw token saklanmaz |
| expires_at | timestamptz NOT NULL | index |
| created_at | timestamptz NOT NULL | |
| revoked_at | timestamptz NULL | anında iptal |

Cookie: `httpOnly + Secure + SameSite=Lax`; login'de rotasyon; expiry + idle
timeout. (JWT seçilirse bu tablo refresh-token tablosuna dönüşür — şu an
onaylanmış model session'dır.)

**3. `categories`** — etkinlik kategorileri (**tablo** olarak onaylandı)

| Kolon | Tip | Not |
|---|---|---|
| id | uuid PK | |
| name | text UNIQUE NOT NULL | |
| slug | text UNIQUE NOT NULL | |
| description | text NULL | |
| sort_order | int NOT NULL DEFAULT 0 | |
| is_active | boolean NOT NULL DEFAULT true | |
| created_at / updated_at | timestamptz NOT NULL | |

**Tablo mi enum mı?** Tablo: PROJECT.md'de "kategori yönetimi" (admin CRUD)
açıkça planlanmış; tablo ile kategori ekleme/çıkarma/sıralama/aktif-pasif
migration gerektirmez, enum'da her değişiklik migration + deploy demek. Eğer
kapsamdan çıkarılırsa enum'a dönüş kolaydır.

**4. `events`** — etkinlikler

| Kolon | Tip | Not |
|---|---|---|
| id | uuid PK | |
| title | text NOT NULL | |
| slug | text UNIQUE NOT NULL | public URL |
| description | text NOT NULL | yayın öncesi zorunluluk uygulama katmanında |
| category_id | uuid FK → categories.id ON DELETE RESTRICT NOT NULL | index |
| location | text NOT NULL | tek adres alanı; ayrı locations tablosu gereksiz (gerekçe: coğrafi sorgu/çoklu lokasyon gereksinimi yok) |
| start_at | timestamptz NOT NULL | sıralama/filtre + DST doğruluğu |
| end_at | timestamptz NOT NULL | CHECK (end_at > start_at) |
| capacity | int NULL | NULL = limitsiz |
| cover_image_url | text NULL | Faz 1 tek kapak görseli; media tablosu ertelendi |
| status | enum NOT NULL DEFAULT 'DRAFT' | `DRAFT` \| `PUBLISHED` \| `CANCELLED` — "durum" ve "yayın durumu" tek alanda birleştirildi |
| published_at | timestamptz NULL | |
| created_at / updated_at | timestamptz NOT NULL | |

**Soft delete yok (bilinçli karar):** `IsDeleted` eklenmiyor. Gerekçe: query
karmaşıklığı, `slug` unique constraint çakışması (geri yükleme), FK davranışı;
admin mutasyonları `audit_logs` ile izlenir. Hard delete + audit kaydı.

**5. `gallery_images`** — galeri

| Kolon | Tip | Not |
|---|---|---|
| id | uuid PK | |
| image_url | text NOT NULL | |
| alt_text | text NOT NULL | erişilebilirlik |
| title | text NULL | |
| sort_order | int NOT NULL DEFAULT 0 | |
| is_active | boolean NOT NULL DEFAULT true | |
| created_at | timestamptz NOT NULL | |

Etkinlik bağlantısı (`event_id` FK) **ertelendi**: etkinliğe özel galeri
gereksinimi yok.

**6. `site_settings`** — site ayarları

| Kolon | Tip | Not |
|---|---|---|
| key | text PK | |
| value | jsonb NOT NULL | yapısal değerler (sosyal medya, iletişim bilgisi) |
| updated_at | timestamptz NOT NULL | |
| updated_by_admin_id | uuid FK → admins.id ON DELETE SET NULL | |

Key-value yaklaşımı: her ayar için şema migration'ı gerektirmez.

**7. `audit_logs`** — yönetici işlem denetimi (append-only)

| Kolon | Tip | Not |
|---|---|---|
| id | uuid PK | |
| actor_admin_id | uuid FK → admins.id ON DELETE SET NULL | index |
| action | text NOT NULL | örn. `EVENT_CREATED`, `EVENT_PUBLISHED`, `SETTINGS_UPDATED` |
| entity_type | text NOT NULL | |
| entity_id | uuid NULL | |
| entity_label | text NULL | silinen kaydın okunabilir kopyası (örn. etkinlik başlığı) |
| metadata | jsonb NULL | |
| ip_address | inet NULL | |
| created_at | timestamptz NOT NULL | index (DESC) |

Kapsam: yalnızca önemli yönetim işlemleri (event oluştur/güncelle/sil/yayınla,
kategori, galeri, ayar değişiklikleri, yönetici işlemleri). Her tablo otomatik
audit'e dönüştürülmüyor. Uygulama üzerinden UPDATE/DELETE yapılmaz (append-only).

### 2.4 Bilerek ertelenen tablolar (tetikleyici kriterleriyle)

| Tablo | Ne zaman eklenecek |
|---|---|
| `event_applications` | Form bazlı katılım/başvuru gereksinimi doğduğunda (şu an akış telefon/WhatsApp) |
| `site_contents` / `pages` | İçerik yönetimi (CMS) ihtiyacı netleştiğinde |
| `media` | Etkinliklere çoklu görsel veya bölümler arası görsel paylaşımı gerektiğinde |
| `users` (public) | Public üyelik/auth gereksinimi doğduğunda |
| `event_occurrences` | Tekrarlayan etkinlik gereksinimi doğduğunda |

### 2.5 İlişkiler

- `categories` 1—N `events` (`events.category_id`)
- `admins` 1—N `admin_sessions` (CASCADE)
- `admins` 1—N `audit_logs` (SET NULL — admin silinse bile kayıtlar korunur)
- `admins` 1—N `site_settings` güncellemeleri (`updated_by`, SET NULL)
- `gallery_images`: bağımsız

### 2.6 Primary key / foreign key yaklaşımı

- **PK:** Tüm tablolarda `id UUID` (`gen_random_uuid()`). Gerekçe: tahmin
  edilemez ID; public URL'ler `slug` üzerinden. (`bigserial` alternatifi;
  dışarıya sızma riski nedeniyle UUID tercih edildi. Bu ölçekte index boyutu
  farkı ihmal edilebilir.)
- **FK:** İsimli constraint'ler. `category_id` = **RESTRICT** (kategori silmek
  yerine `is_active=false` ile devre dışı bırakma); sessions = CASCADE;
  audit/settings = SET NULL.
- **FK kolonları açıkça index'lenecek** — Prisma, PostgreSQL'de FK kolonlarına
  otomatik index oluşturmaz (bilinçli karar).

### 2.7 Unique constraints

`admins.email` (normalize), `categories.name`, `categories.slug`, `events.slug`,
`site_settings.key`, `admin_sessions.token_hash`

### 2.8 Indexler

- `events (status, start_at)` — "yaklaşan yayındaki etkinlikler" ana sorgusu
- `events (category_id)`, `events (slug)` UNIQUE
- `audit_logs (created_at DESC)`, `(actor_admin_id)`, `(entity_type, entity_id)`
- `admin_sessions (expires_at)`, `(admin_id)`

Erken optimizasyon yapılmadı: `categories(sort_order)` ve full-text/pg_trgm
arama index'leri **şimdilik yok** — arama özelliği geldiğinde eklenecek.
Pagination (cursor-based) ve N+1 koruması API katmanında ele alınacak.

### 2.9 Migration planı

- Dev: `prisma migrate dev --name init_core_schema` (yalnızca CREATE;
  **destructive işlem yok** — greenfield) veya EF Core eşdeğeri
- Üretilen migration SQL'i commit öncesi tamamen incelenecek
- Production/staging: `prisma migrate deploy` (CI/CD üzerinden)
- Prisma'da down-migration yoktur → rollback: production'da **backup restore +
  forward-fix migration**
- Uygulanmış migration geçmişi asla düzenlenmeyecek/silinecek/squash edilmeyecek
- `migrate reset` yalnızca lokal dev DB'de ve açık onayla

### 2.10 Seed data

- 8 kategori (README listesi): Kamp, Game Night, Akustik, Gezi,
  Kahve & Tanışma, Açık Hava Sineması, Doğa & Spor, Atölye & Sanat
  (dev + production için geçerli içerik verisi)
- İlk SUPER_ADMIN: env'den okunan bilgilerle script ile oluşturulur; şifre
  hash'li; repo'ya credential yazılmaz; production'da ilk girişte şifre
  değişimi zorunlu
- Örnek etkinlikler yalnızca development seed'inde

### 2.11 Güvenlik gereksinimleri

- Şifre: Argon2id hash; düz metin yasak; log'a yazılmaz
- Oturum token'ı: 256-bit random; DB'de hash'i tutulur; httpOnly + Secure +
  SameSite=Lax cookie; login'de rotasyon; expiry + idle timeout
- Prisma parametrik sorgular → SQL injection kapalı; raw SQL gerekiyorsa sadece
  parametreli `$queryRaw`
- Login'de rate limiting + hesap kilitleme
- RBAC (`ADMIN` / `SUPER_ADMIN`) sunucu katmanında zorlanır
- Tüm admin mutasyonları `audit_logs`'a yazılır
- Least-privilege DB kullanıcısı (uygulama: DML; DDL: migration pipeline)
- Dev/test/prod için ayrı database ve ayrı credential'lar; production
  credential'ları lokal `.env`'de bulunmaz

### 2.12 Environment variables

`.env.example`'a yalnızca placeholder değerler eklenir (gerçek secret asla):

```
DATABASE_URL=postgresql://vanyouthclub:CHANGE_ME@localhost:5432/vanyouthclub_dev?schema=public
```

Ortam bazlı ayrı veritabanları: `vanyouthclub_dev`, `vanyouthclub_test`,
`vanyouthclub` (prod). Ayrım `APP_ENV` ile yapılır.

### 2.13 Development / Production etkisi

- Development: lokal PostgreSQL (Docker Compose önerilir), `.env` dosyası
  `.env.example`'dan kopyalanır, seed script çalışır
- Production: managed PostgreSQL (Supabase/Neon/RDS — seçimi ertelendi);
  migration'lar CI/CD ile uygulanır
- Production veritabanı şu anda mevcut değil; mevcut veri riski sıfır

### 2.14 Backup / recovery

- Günlük `pg_dump` + şifreli offsite saklama (veya managed PITR)
- Üç ayda bir restore tatbikatı
- Migration'lar öncesi ek manuel snapshot alınması kuralı

### 2.15 API / data-access katmanı

- DB erişimi controller/component içine gömülmez; erişim tek modülde toplanır
  (örn. `lib/db` veya `Infrastructure` katmanı) ve Prisma/EF client singleton
  olarak tutulur
- İstek katmanı (route handler / API) → iş kuralı (service fonksiyonu: yayın
  kuralları, kapasite kontrolü) → sorgu modülü
- Repository/Unit-of-Work gibi abstraction'lar **şimdilik eklenmiyor**
  (ORM zaten soyutlama sağlıyor; "enterprise görünüm" için gereksiz katman
  oluşturulmuyor)
- Doğrulama (Zod veya eşdeğeri) istek sınırında; pagination cursor-based

### 2.16 Riskler ve rollback

| Risk | Azaltma |
|---|---|
| Backend/ORM kararı verilmedi | Bu planla birlikte verilecek; database kararı sabit |
| Saat dilimi karışıklığı | `timestamptz` + app katmanında Europe/Istanbul formatlama |
| Kapsam kayması (başvuru, CMS) | Ertelenen tablolar için tetikleyici kriterler tanımlı |
| Secret sızıntısı | `.env.example` disiplini + commit öncesi tarama |
| Soft delete eksikliği sonradan pişmanlık | audit_logs + hard delete ile telafi; sonradan eklenebilir |

Rollback:

- Development: dev DB drop → migration'ları yeniden çalıştır (seed mevcut)
- Production: pg_dump restore + forward-fix migration; migration dosyaları
  git'ten revert (henüz hiçbir yerde uygulanmamışsa)
- **Asla:** production'da DROP/TRUNCATE/RESET, migration geçmişi silme,
  force push

### 2.17 Test planı (implementasyon onayından sonra)

- `prisma validate` / `dotnet ef` eşdeğeri doğrulaması
- Lokal dev DB'de migration; üretilen SQL'in tamamı CREATE olduğu doğrulanır
- Seed + smoke-test sorguları (yaklaşan etkinlikler, kategori filtresi)
- Build (`next build` / `dotnet build`) + typecheck
- Integration test'ler ayrı test DB'sine karşı
- Güvenlik: `git diff` secret taraması, `.env*` gitignore doğrulaması

---

## 3. Sıradaki adımlar (bu planın ötesinde)

1. Backend stack + ORM kararı (bu turda ertelendi)
2. Şema implementasyonu (ORM migration'ları) — **ayrı onay gerekli**
3. Seed script + lokal doğrulama
4. Build/test/güvenlik kontrolü ve rapor

```
IMPLEMENTATION STATUS: DOCUMENTATION ONLY
SCHEMA / MIGRATION / ORM IMPLEMENTATION: BLOCKED — USER APPROVAL REQUIRED
```
