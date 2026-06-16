# Phase 2 — Architecture Evolution (proposal, not yet implemented)

This documents the recommended next-step architecture once the current UAT round is signed off.
Phase 1 (the current work) deliberately keeps the existing monorepo to fix UAT feedback fast and
without risking the live site. Phase 2 is the structural investment for security + scale.

## Why not rewrite now
The current backend is already layered (controllers → services → repositories → models →
validators → migrations) with helmet, CORS, JWT, bcrypt, express-validator and a migration system.
The UAT bugs were small/localized, not foundational. A rewrite during active UAT trades a
near-done product for weeks of re-derivation and regression risk with no user-facing gain.

## Proposed target

```
tokoku/ (or two repos)
├── apps/web      → Next.js frontend (App Router) — deployed to Vercel
└── apps/api      → NestJS backend — deployed to a container host (Fly.io / Render / ECS)
        ├── modules: auth, users, catalog, orders, shipping, warehouses, payments
        ├── Prisma or keep Sequelize behind repositories
        └── Swagger/OpenAPI generated from decorators
```

### 1. Split frontend and backend
- **Benefit:** independent deploy + scale, clearer ownership, backend can serve future mobile apps.
- **Cost to manage:** cross-origin auth (use short-lived JWT access token + httpOnly refresh cookie),
  one CORS allow-list, two CI pipelines.
- Reuse the **existing DB schema and migrations** as-is — no data migration needed.

### 2. Backend → NestJS (incremental, not big-bang)
- Port module-by-module. Start with a new module (e.g. `shipping`) in Nest, run it alongside Express
  behind the same gateway, then migrate the rest.
- Keep the current Sequelize models initially (Nest works fine with Sequelize) to avoid a data-layer
  rewrite; consider Prisma later only if desired.

### 3. The real scalability win: move images off the database  ⚠️ highest priority
- Today product/payment-proof images are stored as **base64 in a Postgres `TEXT` column**.
  This bloats rows, slows queries, and is the actual scaling bottleneck — *not* the web framework.
- Move to object storage (S3 / Cloudflare R2 / Cloudinary). Store only the URL in the DB.
- This also removes the Vercel 4.5 MB serverless body-limit problem behind UAT item #5 (upload errors),
  because the browser uploads directly to storage via a presigned URL.

### 4. Other hardening (carry over from current stack)
- Centralized config + secrets manager (no secrets embedded in `vercel-backend.js`).
- Redis for sessions/rate-limit/caching (already half-wired via `ioredis`).
- Background jobs/queues for emails, stock sync, shipment tracking.
- Structured request tracing + error monitoring (Sentry).

## Suggested sequencing
1. **Now (Phase 1):** ship UAT fixes on current monorepo. ✅ in progress
2. Move images to object storage (biggest scale/security win, smallest blast radius).
3. Split frontend into its own deploy target; lock down CORS + cookie-based refresh tokens.
4. Stand up NestJS, migrate one module, then the rest.
