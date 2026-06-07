# Vercel Deployment Configuration — Tokoku

## Overview

Tokoku di-deploy ke Vercel menggunakan arsitektur multi-service:
- **Frontend**: Next.js 16 (App Router) — served at `/`
- **Backend**: Express.js + Sequelize — served at `/_/backend` via serverless function

## Repository

| Item | Value |
|------|-------|
| GitHub Repo | `https://github.com/aguslin/tokoku` |
| Default Branch | `main` |
| Local Branch | `feat/z.ai` → push ke remote `main` |
| Git Author Email | `agussukiawan@gmail.com` |
| Git Author Name | `aguslin` |

## Vercel Environment Variables

Set di Vercel Dashboard → Settings → Environment Variables:

| Variable | Value | Notes |
|----------|-------|-------|
| `NODE_ENV` | `production` | Auto-set by Vercel |
| `DATABASE_URL` | `postgresql://neondb_owner:npg_EZ91WmoXrwyf@ep-noisy-bonus-aokfl0ci-pooler.c-2.ap-southeast-1.aws.neon.tech/neondb?sslmode=require` | Neon PostgreSQL |
| `JWT_SECRET` | `tokoku_jwt_secret_2024_production_key` | JWT signing secret |
| `JWT_REFRESH_SECRET` | `tokoku_jwt_refresh_secret_2024_production_key` | JWT refresh token secret |
| `JWT_EXPIRES_IN` | `15m` | Access token expiry |
| `JWT_REFRESH_EXPIRES_IN` | `7d` | Refresh token expiry |
| `CORS_ORIGIN` | `*` | Wildcard (public repo) atau `https://tokoku-eight.vercel.app` |
| `VERCEL` | `true` | Auto-set by Vercel, used for conditional code paths |
| `NEXT_PUBLIC_API_URL` | `/_/backend/api/v1` | Frontend API base URL |

> **Catatan**: `DATABASE_URL`, `JWT_SECRET`, `JWT_REFRESH_SECRET` juga di-embed di `vercel-backend.js` sebagai fallback jika env vars belum di-set di Vercel dashboard.

## File Konfigurasi Vercel

### `vercel.json` (Root)

```json
{
  "experimentalServices": {
    "frontend": {
      "routePrefix": "/",
      "framework": "nextjs"
    },
    "backend": {
      "routePrefix": "/_/backend",
      "builder": "@vercel/node",
      "entrypoint": "vercel-backend.js"
    }
  }
}
```

**Penting**:
- Tidak ada `"root": "backend"` — handler berada di root project
- `experimentalServices` menangani multi-service deployment (frontend + backend dalam 1 project)

### `vercel-backend.js` (Root) — Serverless Handler

File ini adalah entry point untuk backend Express di Vercel serverless. Tugasnya:
1. Explicitly `require('pg')` dan `require('pg-hstore')` — agar `@vercel/ncc` bundler menyertakan paket-paket ini (Sequelize load secara dinamis yang tidak bisa di-trace ncc)
2. Load `dotenv.config()` dengan path absolute ke `backend/.env`
3. Set default env vars jika belum ada (DATABASE_URL, JWT_SECRET, dll)
4. Load Express app dari `backend/app.js`
5. Cache koneksi database di `isConnected` flag untuk cold starts
6. Strip prefix `/_/backend` dari `req.url` — Vercel tidak otomatis strip routePrefix

## Struktur File Penting

```
tokoku/
├── vercel.json                          # Vercel multi-service config
├── vercel-backend.js                    # Backend serverless handler (root)
├── package.json                         # Root: Next.js + semua backend deps (untuk ncc)
├── package-lock.json                    # Root lockfile
├── backend/
│   ├── app.js                           # Express app (skip helmet/morgan/swagger di Vercel)
│   ├── src/
│   │   ├── config/
│   │   │   ├── app.js                   # dotenv config dengan absolute path
│   │   │   ├── cors.js                  # CORS dengan wildcard support
│   │   │   ├── database.js              # Sequelize config (SSL untuk Neon)
│   │   │   └── logger.js                # Skip file transport di Vercel
│   │   ├── docs/swagger.js              # Swagger docs (skip di Vercel)
│   │   ├── models/                      # Sequelize models (paranoid mode)
│   │   ├── controllers/                # Express controllers
│   │   ├── services/                   # Business logic
│   │   ├── validators/                  # express-validator chains
│   │   ├── migrations/                  # Sequelize CLI migrations
│   │   └── routes/
│   │       ├── index.js                # Router mount point (/api/v1)
│   │       └── *.routes.js             # Individual route files
│   └── .env                             # Gitignored — tidak ikut ke Vercel
├── app/                                 # Next.js App Router pages
├── components/                          # React components (shared/ui)
├── lib/                                 # Utilities, stores, API clients
└── public/                              # Static assets
```

## Vercel Serverless Constraints & Workarounds

| Constraint | Solution |
|------------|----------|
| **Read-only filesystem** | Winston file transports skipped (`process.env.VERCEL`) |
| **`@vercel/ncc` can't trace dynamic require** | Explicit `require('pg')` and `require('pg-hstore')` di handler |
| **No helmet** | `helmet` manipulasi raw `ServerResponse` headers → crash. Skip: `if (!process.env.VERCEL)` |
| **No morgan** | `morgan` perlu `req.socket.remoteAddress` → skip di Vercel |
| **No swagger-ui-express** | Swagger UI tidak perlu di production → skip di Vercel |
| **No express.static for uploads** | Filesystem read-only → skip. Gambar disimpan sebagai base64 di DB |
| **routePrefix tidak di-strip** | Manual strip `/_/backend` dari `req.url` di handler |
| **backend/.env gitignored** | Env vars di-embed di handler + set di Vercel dashboard |
| **dotenv path harus absolute** | `dotenv.config({ path: require('path').resolve(__dirname, '../../.env') })` |
| **CORS wildcard `\*`** | `allowedOrigins.includes('*')` check untuk treat `\*` as actual wildcard |

## Database Migrations

Migrations dijalankan manual dari lokal, mengarah ke Neon database:

```bash
cd backend
DATABASE_URL="postgresql://neondb_owner:npg_EZ91WmoXrwyf@ep-noisy-bonus-aokfl0ci-pooler.c-2.ap-southeast-1.aws.neon.tech/neondb?sslmode=require" \
  NODE_ENV=production npx sequelize-cli db:migrate
```

**Migrations yang sudah dijalankan:**
- `20240101000001` s/d `20240101000024` — Schema awal + alter product-images url to TEXT
- `20240101000025-add-weight-uom-to-products` — Tambah kolom `weightUom` (kg/gram)

## Image Upload System (Vercel-Compatible)

Karena Vercel filesystem read-only, multer/diskStorage tidak bisa dipakai. Solusi:
1. Frontend membaca file sebagai `FileReader` → `dataURL`
2. Resize via Canvas API (max 800px, JPEG quality 70%)
3. Kirim base64 string sebagai `images[].url` ke backend
4. Backend simpan base64 di kolom TEXT `product_images.url`
5. Frontend render base64 langsung di `<img src="data:image/jpeg;base64,...">` atau `<Image>` dari Next.js

## Product Features

### Field UoM (Unit of Measurement)
- Kolom: `weightUom` (VARCHAR, default: `kg`)
- Opsi: `kg`, `gram`
- Tampil di halaman produk detail dan homepage

### Featured Products (Unggulan)
- Kolom: `isFeatured` (BOOLEAN, default: false)
- API: `GET /_/backend/api/v1/products/featured?limit=8`
- Ditampilkan di halaman pre-login homepage

### Price Auto-Format
- Input Harga dan Harga Asli otomatis format thousand separator saat mengetik
- Format: `280.000` (locale: id-ID)

## Push & Deploy Workflow

```bash
# 1. Pastikan di directory tokoku dan branch feat/z.ai
cd /home/z/my-project/tokoku
git checkout feat/z.ai

# 2. Set git config (sudah default di repo)
git config user.email "agussukiawan@gmail.com"
git config user.name "aguslin"

# 3. Stage, commit, push
git add -A
git commit -m "your commit message"
git push origin feat/z.ai:main

# 4. Vercel akan auto-deploy dari push ke main
# URL: https://tokoku-eight.vercel.app
```

## Troubleshooting

### Deployment Blocked
- **Penyebab**: Commit author tidak punya akses di Vercel
- **Solusi**: Pastikan git author `aguslin <agussukiawan@gmail.com>` (verified email di akun GitHub `aguslin`)
- **Hobby Plan**: Repo harus PUBLIC atau commit author harus punya akses

### FUNCTION_INVOCATION_FAILED
- **Penyebab**: `helmet`, `morgan`, atau `swagger-ui-express` crash di serverless
- **Solusi**: Semua sudah di-skip dengan `if (!process.env.VERCEL)`

### "Please install pg package manually"
- **Penyebab**: ncc tidak bisa trace Sequelize's dynamic `require('pg')`
- **Solusi**: Explicit `require('pg')` di `vercel-backend.js`

### CORS Error
- **Penyebab**: `CORS_ORIGIN=*` diperlakukan sebagai literal string
- **Solusi**: `allowedOrigins.includes('*')` check di `cors.js`

### 404 Route Not Found
- **Penyebab**: Vercel routePrefix `/_/backend` tidak di-strip dari `req.url`
- **Solusi**: Manual strip di handler: `req.url = req.url.slice(prefix.length)`

### Internal Server Error (masked)
- **Penyebab**: `backend/.env` gitignored, env vars kosong di Vercel
- **Solusi**: Embed default env vars di `vercel-backend.js` + set di Vercel dashboard
