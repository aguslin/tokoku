# Tokoku — Memory & Changelog

## Architecture (Local Docker Compose)

```
Browser
  │
  ├── http://localhost:3001  →  Frontend (Next.js production) + Backend (Express)
  │     │                          (both in one container: marketplace-v2)
  │     ├── /api/v1/*       →  rewrite to http://localhost:5000/api/v1/*
  │     └── /uploads/*      →  rewrite to http://localhost:5000/uploads/*
  │
  ├── http://localhost:3000  →  Frontend dev mode (pnpm run dev)
  │     └── /api/v1/*       →  rewrite to http://localhost:5000/api/v1/*
  │
  └── http://localhost:5000  →  Backend API (when running locally with npm run dev)
```

## Architecture (Vercel Production)

```
Browser
  │
  └── https://tokoku-eight.vercel.app
        ├── /                →  Frontend (Next.js 16 App Router)
        │                       Served via vercel.json experimentalServices frontend
        │
        └── /_/backend/*     →  Backend (Express.js serverless)
              ├── /api/v1/*   →  Express routes
              ├── /api-docs   →  Disabled on Vercel
              └── /uploads/*  →  Disabled on Vercel (base64 images in DB)
```

**Key files**: `vercel.json` (multi-service config), `vercel-backend.js` (serverless handler at root)

## Ports & Dev Mode

| Port | Service | Location | Notes |
|------|---------|----------|-------|
| 3000 | Frontend dev (Next.js) | Host: `pnpm run dev` | Fast iteration, hot reload |
| 3001 | Frontend prod (Next.js standalone) | Docker: marketplace-v2 | Rebuild required for changes |
| 5000 | Backend API (Express) | Both Docker & Host | Conflicts if both run |
| 5432 | PostgreSQL | Docker: marketplace-db (local) / Neon (production) | |
| 6379 | Redis | Docker: marketplace-redis | |

## Admin Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@marketplace.com | Admin123! |
| User | user@marketplace.com | User123! |

## Token Storage

- **Admin token**: `localStorage` key `admin-token` (set manually via admin sidebar input)
- **User auth**: `localStorage` key `auth-storage` (zustand persist from `useAuthStore`)
- **Admin API client**: `lib/api/admin.ts` — reads `admin-token`, base URL `/api/v1`
- **User API client**: reads from `auth-storage` for authenticated endpoints

## Key Data Stores (Zustand persist — localStorage)

| Store Key | Module | Purpose |
|-----------|--------|---------|
| `order-storage` | `@/lib/store/order-store` | Local orders (created via checkout) |
| `auth-storage` | `@/lib/store/auth-store` | User auth state + JWT |
| `wishlist-storage` | `@/lib/store/wishlist-store` | Wishlist items |
| `cart-storage` | `@/lib/store/cart-store` | Cart items |
| `voucher-storage` | `@/lib/store/voucher-store` | Voucher codes |

## Orders System — Architecture

### Two-tier order storage
- **Backend DB (PostgreSQL)**: Real orders created via API → visible to admin via `GET /api/v1/orders/all`
- **Frontend local (Zustand)**: Orders created via checkout flow (`addOrder`) — stored in localStorage under `order-storage`

### Admin dashboard order merging
Admin page (`app/(admin)/dashboard/page.tsx`) merges both sources:
```js
const allOrders = [
  ...(data || []),              // backend API orders
  ...localOrders.filter(...     // local zustand orders (not already in API data)
)];
```

### Order status flow
```
pending → paid → confirmed → processing → shipped → completed
                                                              ↓
                                                        cancelled / refunded
```

### Payment status flow
```
pending → submitted → paid
  ↑          ↑
  |          └── User uploads proof → order=paid
  └── No proof uploaded yet
```

## Upload Flow (Vercel-Compatible)

1. Frontend reads file via `FileReader` → base64 `dataURL`
2. Canvas resize (max 800px, JPEG 70%)
3. POST to backend with `images: [{ url: "data:image/jpeg;base64,...", isPrimary, sortOrder }]`
4. Backend stores base64 string in `product_images.url` (TEXT column)
5. Frontend renders base64 directly in `<img src="...">`

> **Catatan**: Multer/diskStorage TIDAK dipakai karena Vercel filesystem read-only.

## Changes Made (Chronological)

### Vercel Deployment (June 2026)
- Created `vercel.json` with `experimentalServices` for multi-service (frontend + backend)
- Created `vercel-backend.js` at project root as serverless handler
- Moved all backend dependencies to root `package.json` (so `@vercel/ncc` can resolve them)
- Explicitly `require('pg')` and `require('pg-hstore')` in handler (ncc can't trace Sequelize's dynamic requires)
- Conditionally skip `helmet`, `morgan`, `swagger-ui-express`, `express.static` on Vercel (`process.env.VERCEL`)
- Manual strip `/_/backend` prefix from `req.url` (Vercel doesn't auto-strip routePrefix)
- Fixed CORS wildcard: `allowedOrigins.includes('*')` in `cors.js`
- Embed default env vars in handler (DATABASE_URL, JWT_SECRET, etc.)
- Winston file transports skipped on Vercel

### Product Image Upload Fix
- Converted from multer/diskStorage to base64 (Vercel read-only filesystem)
- Frontend: FileReader + Canvas resize to 800px JPEG 70%
- Migration `20240101000024`: Changed `product_images.url` from VARCHAR(255) to TEXT
- JSON body limit raised to 50mb in Express

### Homepage Featured Products
- Removed mock data dependency for product sections
- Fetches featured products from API: `GET /_/backend/api/v1/products/featured?limit=8`
- Fixed controller bug: `getFeatured` was passing `req.query` (object) instead of `limit` (number) to service
- Removed "Belanja Berdasarkan Kategori" section

### Product Form Improvements
- Price input auto-format with thousand separator (locale: id-ID)
- Harga, Harga Asli, Berat inputs all auto-format
- Delete button (X) on product images always visible (no hover needed)
- Modal size enlarged to `2xl` (672px) for description editing space
- Added `weightUom` field: dropdown Kg/Gram next to weight input
- Migration `20240101000025`: Added `weightUom` column to products table
- Updated Product model, validator, and service for `weightUom`
- Weight + unit displayed on product detail page and homepage cards

### Error Handler Improvements
- Added handler for malformed JSON body (`entity.parse.failed`)
- Added handler for connection timeout errors (`ECONNREFUSED`, `ETIMEDOUT`)

### Frontend Auth
- Password validation on register page matches backend rules (uppercase + lowercase + digit + min 8)
- Debug logging removed from login page

### Git Configuration
- Git author: `aguslin <agussukiawan@gmail.com>` (verified on GitHub account `aguslin`)
- Local branch: `feat/z.ai` → push to remote `main`
- GitHub token: Check `git remote get-url origin` (not committed for security)

## Current Issues / Known Bugs

### [FIXED] req.user.id → req.user.userId
- JWT payload: `{ userId, role }`, controllers now use `req.user.userId`

### [FIXED] Double stock decrement
- UUID validator prevents non-UUID order IDs from reaching backend
- Added detailed logging for stock/sold changes

### [FIXED] Sold increment on local orders
- Admin dashboard fallback handles sold increment when API fails

### [FIXED] Featured products not showing
- Controller was passing `req.query` (object) instead of `limit` (number) to `productService.getFeatured()`

### [KNOWN] Admin orders page local orders
- localStorage is per-origin/port, orders stored on one port aren't visible on another

## Logging & Debugging

### Backend logging
- `[ORDER STATUS]` — order status transitions
- `[STOCK DECREMENT]` — stock changes on shipped
- `[PRODUCT UPDATE]` — stock/sold direct changes
- View logs: Vercel Dashboard → Logs, or `docker logs marketplace-v2` for local

## Known Environment Details

- **Local**: `NEXT_PUBLIC_API_URL=/api/v1` (`.env.local`)
- **Vercel**: `NEXT_PUBLIC_API_URL=/_/backend/api/v1`
- Backend DB (production): Neon PostgreSQL via `DATABASE_URL` env var
- TypeScript build errors IGNORED: `next.config.mjs` has `typescript: { ignoreBuildErrors: true }`
- `next.config.mjs` has `output: 'standalone'` for Docker deployment

## Vercel Deployment Checklist

- [ ] Git author set to `aguslin <agussukiawan@gmail.com>`
- [ ] All backend deps in root `package.json`
- [ ] `vercel.json` has `experimentalServices` (no `"root": "backend"`)
- [ ] `vercel-backend.js` at project root with explicit `require('pg')`
- [ ] Env vars set in Vercel dashboard (DATABASE_URL, JWT_SECRET, etc.)
- [ ] CORS_ORIGIN includes `https://tokoku-eight.vercel.app` or `*`
- [ ] Push to `main` → Vercel auto-deploys
- [ ] Run migrations manually after schema changes
