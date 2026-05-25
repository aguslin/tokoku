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

## Logging & Debugging

### Backend logging (added 2026-05-25)
- Logging added to `backend/src/services/order.service.js:updateStatus`:
  - On `SHIPPED` transition: logs orderId, items (productId, productName, quantity), and before/after stock values
- Logging added to `backend/src/services/product.service.js:update`:
  - Logs product ID, name, old stock/sold value, and new value whenever stock or sold is directly set
- **Log tag**: `[ORDER STATUS]`, `[STOCK DECREMENT]`, `[PRODUCT UPDATE]`
- View logs: `docker logs marketplace-v2`

### Backend Docker rebuild
- The `app.js:64` validation error fix is now included in Docker build (no longer lost on restart)

### Route validator fix
- `backend/src/routes/order.routes.js:13`: Added `orderValidator.updateOrderStatus` middleware to validate UUID param before reaching controller
- Previously, non-UUID order IDs caused PostgreSQL casting errors → 500 Internal Server Error
- Now correctly returns 422 validation error for invalid UUIDs

## Current Issues / Bugs

### [FIXED 2026-05-25] Sold increment not working for local orders on "delivered" & "confirm-receipt"
- **Symptom**: Stock decrement worked when admin set "Dikirim", but "terjual" never incremented for local (zustand-only) orders
- **Root causes**:
  1. `backend/src/services/order.service.js` — `confirmReceipt` function was defined but **not exported** from `module.exports` → backend crashed with 500 on confirm-receipt API call
  2. `app/(admin)/dashboard/page.tsx` — Admin can only set status to `delivered` (not `completed`), but sold increment fallback only checked `newStatus === 'completed'` → never fired
  3. `app/(user)/orders/[id]/page.tsx` — Fallback used `admin-token` exclusively; skipped silently if missing
- **Fixes**:
  1. Added `confirmReceipt` to `module.exports` in `order.service.js`
  2. Admin fallback now also handles `delivered` status for sold increment (line 799)
  3. User page fallback now falls back to user's auth token if admin token missing, plus console.warn for diagnostics
- **Files**: `backend/src/services/order.service.js`, `app/(admin)/dashboard/page.tsx`, `app/(user)/orders/[id]/page.tsx`

### [FIXED] Admin dashboard product stock not refreshing after order status update
- **Symptom**: After admin changes order status to "Dikirim" (shipped), the Products tab still shows old stock values until full page refresh
- **Root cause**: `OrdersSection.updateStatus()` only called `refetch()` (orders refetch) — products data was fetched once at mount and never refreshed
- **Fix**: `app/(admin)/dashboard/page.tsx`:
  1. Passed `refetchProducts={products.refetch}` from `DashboardContent` to `OrdersSection` (line 138)
  2. `OrdersSection` now accepts `refetchProducts` prop (line 714)
  3. After status changes to `shipped` or `completed`, calls `refetchProducts?.()` (line 811)
- **Files**: `app/(admin)/dashboard/page.tsx`

### [FIXED] Sold increment not working when user confirms receipt ("terjual" not updating)
- **Symptom**: Stock decrement works when admin sets "Dikirim", but "terjual" (sold) doesn't increment when user clicks "Konfirmasi Penerimaan"
- **Root cause**: `backend/src/controllers/order.controller.js` — The JWT generates payload `{ userId: user.id, role }`, so `req.user = { userId, role }`. But ALL controllers used **`req.user.id`** instead of `req.user.userId`. Since `req.user.id` is `undefined`, `confirmReceipt` throws 403 Forbidden (`order.userId !== undefined` is always true).
- **Affected endpoints**:
  - `POST /api/v1/orders/:id/confirm-receipt` — always returned 403 → frontend fallback runs, but requires `admin-token` in localStorage (regular user doesn't have it) → sold never incremented
  - `POST /api/v1/orders` (`createOrder`) — same `req.user.id` bug
  - `GET /api/v1/orders` (`getUserOrders`) — same bug
  - `GET /api/v1/orders/:id` (`getOrderById`) — passed whole `req.user` object instead of userId string
  - `POST /api/v1/orders/:id/cancel` (`cancelOrder`) — passed whole `req.user` object
- **Fix**: Changed all `req.user.id` → `req.user.userId` and `req.user` → `req.user.userId` in `backend/src/controllers/order.controller.js`
- **Files**: `backend/src/controllers/order.controller.js` (lines 6, 11, 21, 31, 36)

### [FIXED] Stock goes from 100 to 0 when admin changes order to "Dikirim" (qty 1)
- **Symptom**: Single order status update to "shipped" with quantity 1 changes product stock from 100 to 0
- **Investigation from Docker logs** (`docker logs marketplace-v2`):
  - Found `PUT /api/v1/orders/ORD-222308/status → 500` — frontend sent **order number** (`ORD-222308`) instead of UUID as order ID
  - PostgreSQL can't cast non-UUID to uuid type → `SequelizeDatabaseError` → 500 Internal Server Error
  - After 500 error, the **frontend fallback runs** (`!res.success` is true):
    1. `updateLocalOrderStatus()` — tries to update zustand order (might not match if ID is wrong)
    2. Stock decrement via `adminApi.put('/products/:id', { stock: newStock })` — correctly decrements
  - BUT: When the API returns 500 **after** the backend already partially processed the request, the backend may have already decremented stock before the error occurred
- **Probable causes**:
  1. **Double decrement**: Backend partially processes (stock decremented), then error occurs → frontend fallback ALSO decrements stock
  2. **Wrong order ID**: Admin selected an order whose `id` field is actually the `orderNumber` (happens if API response shape differs from expected `Order` interface)
  3. **500 on backend order**: Backend decrements stock then fails → frontend fallback decrements again (double decrement)
- **Mitigations applied**:
  1. Added `orderValidator.updateOrderStatus` middleware to validate UUID format before processing
  2. Added detailed backend logging to trace actual stock values
  3. Fixed display refresh so admin can see real-time stock changes
- **Still needs investigation**: If the 500 error's partial processing is confirmed, the `updateStatus` function in `order.service.js` should either:
  - Roll back stock decrement on failure after decrement
  - Or use a transaction

### [KNOWN] Admin orders page shows "Belum ada pesanan" — local orders not appearing
- **Symptom**: Admin page shows "Belum ada pesanan" even when local zustand store has orders (user orders page works fine)
- **Probable cause**: localStorage `order-storage` key exists on port 3000 (user page) but not on port 3001 (admin Docker). localStorage is per-origin/port, so after switching to dev mode (port 3000), the orders stored under port 3000's localStorage aren't visible on Docker's port 3001. Need to check if orders appear on port 3001 admin page when created on port 3001.
- **To debug**: On the relevant port's admin page, check `JSON.parse(localStorage.getItem('order-storage'))` in console

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
