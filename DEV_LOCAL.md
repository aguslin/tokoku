# Local Development (no Docker)

During development we run the backend and frontend directly with Node, connecting to the
**Neon** cloud Postgres. Docker is only used for the final production-style build.

## Prerequisites
- Node.js 18+ (tested on Node 24)
- The Neon `DATABASE_URL` (already in `backend/.env`)

## 1. Backend (Express API) → http://localhost:5000

```bash
cd backend
npm install            # first time only
npm run dev            # nodemon server.js — runs pending migrations on boot
```

`backend/.env` holds the Neon `DATABASE_URL`, JWT secrets and `NODE_ENV=development`.
SSL to Neon is enabled automatically in `src/config/database.js` when `DATABASE_URL` is set.

## 2. Frontend (Next.js) → http://localhost:3001

```bash
# from project root
npm install            # first time only
npm run dev -- -p 3001
```

Port 3000 is reserved for another project (see `AGENT.md`), so use **3001**.
In dev, `next.config.mjs` proxies `/api/v1/*` and `/uploads/*` to the backend on `:5000`,
so the browser only ever talks to `:3001` (no CORS issues).

## Credentials (seeded)

| Role  | Email                   | Password   |
|-------|-------------------------|------------|
| Admin | admin@marketplace.com   | Admin123!  |
| User  | user@marketplace.com    | User123!   |

> The admin dashboard reads its bearer token from `localStorage['admin-token']`.
> Log in via `/login` as admin, or paste the access token into the admin sidebar token field.

## Useful

- API docs (Swagger): http://localhost:5000/api-docs
- Health: http://localhost:5000/api/v1/health
- Run a one-off migration manually:
  ```bash
  cd backend && npx sequelize-cli db:migrate
  ```
