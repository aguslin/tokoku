# Marketplace v2 — Memory

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

## Ports & Dev Mode

| Port | Service | Location | Notes |
|------|---------|----------|-------|
| 3000 | Frontend dev (Next.js) | Host: `pnpm run dev` | Fast iteration, hot reload |
| 3001 | Frontend prod (Next.js standalone) | Docker: marketplace-v2 | Rebuild required for changes |
| 5000 | Backend API (Express) | Both Docker & Host | Conflicts if both run |
| 5432 | PostgreSQL | Docker: marketplace-db | Persistent volume |
| 6379 | Redis | Docker: marketplace-redis | |

**Dev mode (fast, no Docker rebuild):**
```bash
docker compose stop app        # stop the full container (frees port 5000)
cd backend && npm run dev &     # backend on :5000 (nodemon, hot-reload)
pnpm run dev                    # frontend on :3000 (Next.js dev, instant HMR)
```

**Docker rebuild (for production-like testing):**
```bash
docker compose up --build -d app
```

## Containers (Docker Compose)

| Container | Image | Ports |
|-----------|-------|-------|
| marketplace-v2 | marketplace-v2-app | 3001→3001, 5000→5000 |
| marketplace-db | postgres:15-alpine | 5432 |
| marketplace-redis | redis:7-alpine | 6379 |

## Admin Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@mail.com | Admin@123 |
| User | user@mail.com | User123! |

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
Admin page (`app/(admin)/dashboard/page.tsx:723-754`) merges both sources:
```js
const allOrders = [
  ...(data || []),              // backend API orders
  ...localOrders.filter(...     // local zustand orders (not already in API data)
       .map(lo => ({
         OrderItems: lo.items.map(...),   // local orders have `items` (lowercase)
         Payments: [...],                  // derived from status/proof
       }))
];
```

### Order status flow (frontend)
```
pending → paid → confirmed → processing → packed → shipped → delivered → completed
                                                                    ↓
                                                              cancelled / refunded
```

### Order status flow (backend ORDER_STATUS constants in `backend/src/constants/index.js`)
```
pending → paid → confirmed → processing → shipped → delivered → completed
                                                                    ↓
                                                              cancelled / refunded
```
Note: Backend has `packed` missing from ORDER_STATUS (but may still appear in frontend).

### Payment status flow
```
pending → submitted → paid → (none)
  ↑          ↑
  |          └── User uploads proof → order=paid
  └── No proof uploaded yet
```

## Changes Made

### Marketplace page (`app/(user)/marketplace/page.tsx`)
- Product grid: `grid-cols-2 sm:grid-cols-4 lg:grid-cols-4` (4 columns on mobile)
- Image heights: `h-28 sm:h-48` (smaller on mobile)
- "Semua Produk" heading removed
- "Tambah ke Keranjang" button hidden on mobile via `hidden sm:block`
- Shows "N terjual" when `sold > 0`
- Wishlist add button sends extra fields (slug, sellerName, stock, comparePrice, sold)

### Product detail page (`app/(user)/marketplace/[id]/page.tsx`)
- Fixed image gallery bug: `displayImage` was dead variable pointing to primary image; now uses `mainImage` = `images[selectedImage]`
- Wishlist add includes extra fields

### User orders page (`app/(user)/orders/page.tsx`)
- Filter tabs: Semua, Belum Bayar, Dikemas, Dikirim, Selesai, Pengembalian, Dibatalkan
- Order cards: square product image left (20%), status text-only top-right, product name below, date+xN below, total bottom-right
- Whole card is a `<Link>` — no separate Detail button
- Reduced padding, heading closer to top

### Order detail page (`app/(user)/orders/[id]/page.tsx`)
- Calls `POST /api/v1/orders/:id/confirm-receipt` with auth token from `auth-storage` localStorage
- After success, updates local order status via `useOrderStore`

### Wishlist page (`app/(user)/wishlist/page.tsx`)
- Card layout matches marketplace: `grid-cols-2 sm:grid-cols-4`, `h-28 sm:h-48`
- Removed unused cart/trash action buttons
- Shows "N terjual" when `sold > 0`

### Wishlist store (`lib/store/wishlist-store.ts`)
- Extended `WishlistItem` interface with optional fields: `slug`, `sellerName`, `stock`, `comparePrice`, `sold`

### Admin orders table (`app/(admin)/dashboard/page.tsx`)
- Extended `Order` interface with `OrderItems?` field
- Displays product names in each order row

### Admin status update & stock/sold flow (`app/(admin)/dashboard/page.tsx:783-803`)
- `updateStatus()` calls `PUT /api/v1/orders/:id/status`
- If API fails (local-only order), falls back to `updateLocalOrderStatus()`
- If new status = `shipped` AND API failed: tries to decrement stock via `PUT /api/v1/products/:id` for each order item
- Uses `adminApi` (reads `admin-token` from localStorage)

### Backend order service (`backend/src/services/order.service.js`)
- `updateStatus`: stock decrements on transition to `shipped` via `Product.decrement('stock', { by: item.quantity })`
- `confirmReceipt`: transitions `delivered → completed`, increments `sold` via `Product.increment('sold', { by: item.quantity })`

### Backend routes (`backend/src/routes/order.routes.js`)
- `POST /:id/confirm-receipt` — authenticated (not admin-only), calls `confirmReceipt`

### Migration (`backend/src/migrations/20240101000023-add-sold-to-products.js`)
- Added `sold` column (INTEGER, default 0) to `products` table
- Run manually inside container because Umzug glob `src/migrations/*.js` resolved from CWD `/app` (not `/app/backend`)
- **Fix applied**: `backend/server.js` now uses `__dirname + '/src/migrations/*.js'` for absolute path

## Current Issues / Bugs

### [BUG] Admin orders page shows "Belum ada pesanan" — local orders not appearing
- **Symptom**: Admin page shows "Belum ada pesanan" even when local zustand store has orders (user orders page works fine)
- **Probable cause**: localStorage `order-storage` key exists on port 3000 (user page) but not on port 3001 (admin Docker). localStorage is per-origin/port, so after switching to dev mode (port 3000), the orders stored under port 3000's localStorage aren't visible on Docker's port 3001. Need to check if orders appear on port 3001 admin page when created on port 3001.
- **To debug**: On the relevant port's admin page, check `JSON.parse(localStorage.getItem('order-storage'))` in console

### [BUG] Stock not decreasing when admin changes order to "Dikirim"
- **Symptom**: Admin changes order status to "Dikirim" (shipped), but product stock doesn't decrease
- **Causes**:
  1. **Orders are local-only (not in backend DB)**: `PUT /api/v1/orders/:id/status` returns 404, falls back to `updateLocalOrderStatus` only
  2. **Fallback stock decrement may fail**: Admin page tries `adminApi.get('/products/:id')` then `adminApi.put('/products/:id', { stock })` — may fail silently (network, auth, or product not found)
  3. **No error surface**: All failures are silent (no toast, no console log visible to user)
- **Affected code**: `app/(admin)/dashboard/page.tsx:783-803`

### [BUG] Sold not increasing when user confirms receipt
- **Symptom**: User clicks "Pesanan Diterima" on `orders/[id]` page, but product sold count doesn't increase
- **Causes**:
  1. **Orders are local-only**: `POST /api/v1/orders/:id/confirm-receipt` returns 404 (order not in backend), never reaches `confirmReceipt` service function
  2. **No local fallback**: Unlike admin status update, there's no fallback code to increment sold locally
- **Affected code**: `app/(user)/orders/[id]/page.tsx` — calls API but doesn't handle failure case

### [BUG] Backend validation error fix not persistent
- **Problem**: `backend/app.js:64` fix (changing validation error check from `err.name === 'ValidationError'` to `err.errors && Array.isArray(err.errors)`) was applied via `docker cp` — lost on container restart
- **Fix**: Needs Docker rebuild to persist

## Upload Flow

1. Frontend creates `FormData` with files
2. POST to `${apiUrl}/upload/images` with `Authorization: Bearer <admin-token>`
3. Multer middleware saves to `../../storage/uploads/`
4. Returns `{ success: true, data: [{ url: '/uploads/<uuid>.<ext>', name, size, mimetype }] }`
5. Product payload includes `images: [{ url, isPrimary, sortOrder }]`
6. Backend serves static files from `storage/uploads` via `express.static`
7. Next.js rewrite proxies `/uploads/:path*` → `http://localhost:5000/uploads/:path*`

## Known Environment Details

- `NEXT_PUBLIC_API_URL=/api/v1` (`.env.local`)
- Backend `DB_HOST=localhost`, `REDIS_URL=redis://localhost:6379` (for host dev mode)
- Docker overrides: `DB_HOST=db`, `REDIS_URL=redis://redis:6379`
- TypeScript build errors are IGNORED: `next.config.mjs` has `typescript: { ignoreBuildErrors: true }`
- `next.config.mjs` has `output: 'standalone'` for Docker deployment
- Order confirm-receipt frontend reads auth token from `localStorage('auth-storage')` to match existing payment API pattern
