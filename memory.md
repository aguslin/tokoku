# Marketplace v2 — Memory

## Architecture

```
Browser (user)
  │
  ├── http://187.77.139.103:3001  →  Frontend (Next.js, Docker container: marketplace-frontend)
  │     └── /api/v1/*  →  rewrites proxy to backend internally
  │
  └── http://187.77.139.103:5000  →  Backend API (Express, Docker container: marketplace-api)
        └── Blocked by hosting firewall from outside; only reachable internally
```

## Ports

| Port | Service | Container | Status |
|------|---------|-----------|--------|
| 3000 | Catatkas (other project) | catatkas-web | Reserved — DO NOT USE |
| 3001 | Marketplace Frontend (Next.js) | marketplace-frontend | Open to internet |
| 5000 | Marketplace Backend API | marketplace-api | Internal only (firewall blocked) |

## CORS

Backend CORS config (`backend/src/config/cors.js`):
- Allowed origins: `http://localhost:3001`, `http://187.77.139.103:3001`
- NODE_ENV=development → all origins permitted via `isDev` fallback
- Credentials enabled
- Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS

## Frontend → Backend Proxy

Since port 5000 is blocked by the hosting firewall, API requests are proxied through the frontend using Next.js rewrites:

**`next.config.mjs`:**
```js
async rewrites() {
  return [
    {
      source: '/api/v1/:path*',
      destination: 'http://marketplace-api:5000/api/v1/:path*',
    },
  ]
}
```

**`NEXT_PUBLIC_API_URL`:** `/api/v1` (relative path — same origin, avoids CORS entirely)

Flow:
1. Browser sends request to `http://187.77.139.103:3001/api/v1/auth/login`
2. Next.js server on port 3001 receives it
3. Rewrite proxies internally to `http://marketplace-api:5000/api/v1/auth/login`
4. Backend responds, Next.js forwards response to browser

## Containers

| Container | Image | Network | Ports |
|-----------|-------|---------|-------|
| marketplace-frontend | marketplace-v2-app | marketplace-v2_marketplace-network | 3001→3000 |
| marketplace-api | backend-app | marketplace-v2_marketplace-network | 5000→5000 |
| marketplace-db | postgres:15-alpine | marketplace-v2_marketplace-network | 5432 |
| marketplace-redis | redis:7-alpine | marketplace-v2_marketplace-network | 6379 |

## Fixes Applied

1. **CORS origin** — Added `http://187.77.139.103:3001` to backend CORS_ORIGIN
2. **API URL** — Changed from `localhost:5000` to server IP, then to relative `/api/v1`
3. **Docker network** — API container was on wrong network (`backend_marketplace-network`); moved to `marketplace-v2_marketplace-network` to reach DB
4. **Next.js rewrite** — Added to proxy API through port 3001, bypassing firewall block on port 5000
5. **IPv4 fix** — Rewrite destination uses `marketplace-api` hostname (Docker DNS) instead of `localhost` (which resolved to IPv6)

## Demo Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@marketplace.com | Admin123! |
| User | user@marketplace.com | User123! |

## Admin Panel Access

URL: `http://187.77.139.103:3001/dashboard`

The admin panel stores its own Bearer token separately in localStorage under key `admin-token`. To access:
1. Login via regular login page with admin credentials
2. Copy the access token from the response
3. Go to `/dashboard`, click "API Token (not set)" in the sidebar
4. Paste token, click "Set"
