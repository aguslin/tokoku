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
  └── http://localhost:3002  →  Frontend dev server (host, for fast iteration)
        └── /api/v1/*       →  rewrite to http://localhost:5000/api/v1/*
```

## Ports

| Port | Service | Container | Status |
|------|---------|-----------|--------|
| 3000 | Old Next.js dev server (may be running) | Host | May conflict |
| 3001 | Marketplace app (Next.js prod + Express) | marketplace-v2 | Docker Compose |
| 3002 | Marketplace frontend dev server | Host (nohup) | For fast iteration |
| 5000 | Backend API (inside app container) | marketplace-v2 | Exposed to host |
| 5432 | PostgreSQL | marketplace-db | Internal |
| 6379 | Redis | marketplace-redis | Internal |

## Containers (Docker Compose)

| Container | Image | Network | Ports |
|-----------|-------|---------|-------|
| marketplace-v2 | marketplace-v2-app | marketplace-v2_marketplace-network | 3001→3001, 5000→5000 |
| marketplace-db | postgres:15-alpine | marketplace-v2_marketplace-network | 5432 |
| marketplace-redis | redis:7-alpine | marketplace-v2_marketplace-network | 6379 |

## Admin Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@mail.com | Admin@123 |
| User | user@mail.com | User123! |

## Token Storage

- Admin token stored in `localStorage` key: `admin-token` (separate from regular auth store)
- Frontend reads it via `getAdminToken()` in `lib/api/admin.ts`
- Admin layout has a manual token input in sidebar (for debugging)

## Fixes Applied

### 1. Storage directory permissions (Docker volume)
- **Problem**: Multer upload fails with `EACCES: permission denied, open '/app/backend/storage/uploads/...'` because `appuser` (UID 1001) can't write to host-mounted volume owned by `agus`
- **Fix**: `chmod 777` on `backend/storage/uploads` and `backend/storage/logs`
- **Files**: Volume mount in `docker-compose.yml:62`

### 2. Product creation fails when no category selected
- **Problem**: Frontend `handleSave` sends `categoryId: null` in payload. Backend express-validator `.optional()` does not skip `null` values (only skips undefined/missing keys). `isUUID()` fails on `null`. Result: validation error silently swallowed, modal closes, no product created.
- **Fix**: `handleSave` now does `if (!form.categoryId) delete payload.categoryId` to omit the field entirely when empty
- **Files**: `app/(admin)/dashboard/page.tsx:483`

### 3. Silent error swallowing in product save
- **Problem**: `handleSave` called `await adminApi.post(...)` but never checked the result — always closed modal and refetched regardless of success/failure
- **Fix**: Added `if (!res.success) { toast.error(...); setSaving(false); return; }` — shows error toast and keeps modal open
- **Files**: `app/(admin)/dashboard/page.tsx:484-492`

### 4. Sonner toast notifications
- **Problem**: No toast notification system was rendered in admin layout, so errors were invisible
- **Fix**: Added `<Toaster richColors closeButton position="top-right" />` to admin layout
- **Files**: `app/(admin)/layout.tsx:138`

### 5. Docker build pipeline
- **Problem**: Original Dockerfile had issues with pnpm (frozen-lockfile, permissions)
- **Fix**: Added `ENV CI=true` and `ENV PNPM_CONFIRM_MODULES_PURGE=false`; optimized build stages
- **Files**: `Dockerfile:18-19`

### 6. Backend startup
- **Problem**: `backend/storage/logs` dir didn't exist on host, volume mount failed silently
- **Fix**: Created the directory on host, set permissions to 777
- **Files**: Volume mount at `docker-compose.yml:62`

## Known Validator Behavior

Backend `product.validator.js`:
- `name`: required, max 200 chars
- `description`: required, trimmed, notEmpty
- `price`: required, positive float
- `stock`: required, non-negative int
- `categoryId`: optional, UUID if present
  - `body('categoryId').optional().isUUID()` — `.optional()` only skips **missing keys** or `undefined`, NOT `null`
  - Sending `"categoryId": null` → validation fails
  - Sending no `categoryId` key → passes validation (becomes `null` in DB)
- Images are optional in create; multer handles file upload separately

## Upload Flow

1. Frontend creates `FormData` with files
2. POST to `${apiUrl}/upload/images` with `Authorization: Bearer <admin-token>`
3. Multer middleware (in `backend/src/middlewares/upload.js`) saves to `../../storage/uploads/` (relative to middlewares dir)
4. Returns `{ success: true, data: [{ url: '/uploads/<uuid>.<ext>', name, size, mimetype }] }`
5. Frontend stores URLs in `uploadedImages` state array
6. On save, product payload includes `images: [{ url, isPrimary, sortOrder }]`
7. Backend serves static files from `storage/uploads` via `express.static`
8. Next.js rewrite proxies `/uploads/:path*` → `http://localhost:5000/uploads/:path*`

## Image Upload Restrictions (multer)
- Allowed MIME types: `image/jpeg`, `image/png`, `image/webp` (no SVG!)
- File size limit: 5MB (configurable in multer middleware)

## Fast Development Loop

When making frontend changes, use host dev server instead of rebuilding Docker:

```bash
# Start dev server (if not running)
cd /home/agus/ProgramProject/marketplace-v2
nohup env PORT=3002 npx next dev > /tmp/next-dev.log 2>&1 &

# Frontend changes are live at http://localhost:3002
# Backend API is accessible via built-in rewrites → Docker backend on port 5000
```

To rebuild Docker image (for production):
```bash
docker compose build app
docker compose up -d app
```

### 7. Validation error response missing field details
- **Problem**: `backend/app.js` error handler checked `err.name === 'ValidationError'` but `ApiError` instances (from `validate.js` middleware) have `name: "Error"` (default from `Error` class). Field-level errors (`apiError.errors`) were discarded.
- **Fix**: Changed condition from `err.name === 'ValidationError'` to `err.errors && Array.isArray(err.errors)` — catches any error with field-level errors regardless of `err.name`
- **Files**: `backend/app.js:64`
- **Note**: This was applied to the running Docker container via `docker cp`. It will NOT persist across container restart. Must rebuild Docker image or re-apply `docker cp` after restart.

### 8. Frontend adminApi hides field-level validation errors
- **Problem**: `adminApi.request` returned only `json.message` (e.g., "Validation failed") without appended field errors
- **Fix**: When `json.errors` exists, append them to error message (e.g., `"Validation failed: Product description is required."`)
- **Files**: `lib/api/admin.ts:43-46`

## Deploying Backend Changes to Docker

After editing backend files, apply them to the running container:
```bash
docker cp backend/app.js marketplace-v2:/app/backend/app.js
docker exec -d marketplace-v2 sh -c "sleep 2 && PORT=5000 node /app/backend/server.js"
```
⚠️ Changes don't persist across container restart — you must rebuild the Docker image for permanent deployment.

## Verification

- ✅ Product creation confirmed working on `http://192.168.1.3:3001` (Docker production)
- ✅ Toast notifications visible (success/error)
- ✅ Validation errors show specific field details (e.g., "Product description is required.")
- ✅ Image upload working (fixed permissions on `storage/uploads/`)

## Current Issues / TODOs

- [ ] **Rebuild Docker image**: `backend/app.js` fix was `docker cp`'d into running container — will reset on container restart. Run `docker compose build --no-cache app` to make permanent
- [ ] **Rebuild Docker for frontend fixes**: Docker frontend still has code from before `handleSave`/toast/`adminApi` edits. Run `docker compose build --no-cache app` to include them
- [ ] **Hostinger deployment**: memory.md still references old separate-container setup (marketplace-frontend, marketplace-api); needs updates for Docker Compose deployment
- [ ] **Non-admin product creation**: User-facing product management not verified
- [ ] **Image display in table**: After upload + save, verify images render correctly in product list
- [ ] **Empty state UX**: Product section shows "Belum ada produk" with no "Tambah" button when empty — user can't add first product from empty state
