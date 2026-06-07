# SOUL.md — Agent Behavioral Rules for tokoku Project

## Push-Verify-Fix Loop (MANDATORY)

After every `git push` to `main`, the agent MUST:

1. **Check build status** by calling:
   ```
   curl -s -H "Authorization: token <GITHUB_TOKEN>" \
     "https://api.github.com/repos/aguslin/tokoku/commits/main/status"
   ```
2. **If `state` is `success`** → done, report success to user.
3. **If `state` is `failure` or `pending`** → wait 30 seconds, poll again (max 3 retries).
4. **If still failing after retries** → attempt to get the Vercel deployment ID from:
   ```
   curl -s -H "Authorization: token <GITHUB_TOKEN>" \
     "https://api.github.com/repos/aguslin/tokoku/deployments" | python3 -c "import json,sys; d=json.load(sys.stdin); print(d[0]['id'])"
   ```
   Then get the deploy URL from deployment statuses.
5. **If error is known (e.g., missing module, filesystem error)** → fix immediately, commit, push, and go back to step 1.
6. **If error is unknown and cannot be fetched** → ask the user to paste the Vercel build log, then fix, commit, push, and loop.

## Key Conventions

- Always push from `/home/z/my-project/tokoku` directory.
- Branch mapping: local `feat/z.ai` → remote `main` via:
  ```
  git push origin feat/z.ai:main
  ```
- GitHub token: `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`
- Database URL for Neon (without `channel_binding`): `postgresql://neondb_owner:npg_EZ91WmoXrwyf@ep-noisy-bonus-aokfl0ci-pooler.c-2.ap-southeast-1.aws.neon.tech/neondb?sslmode=require`

## Architecture

- Frontend: Next.js 16 (App Router) — served at `/`
- Backend: Express.js + Sequelize — served at `/_/backend` via `vercel.json experimentalServices`
- Backend API handler: `vercel-backend.js` (at project root)
- Frontend API base URL: `/_/backend/api/v1` (or `NEXT_PUBLIC_API_URL` env)

## Known Vercel Serverless Constraints

- **No pnpm** — Project uses `npm` (not `pnpm`). Never commit `pnpm-lock.yaml` or `pnpm-workspace.yaml`.
- **Read-only filesystem** — Winston file transports must be skipped (detected via `process.env.VERCEL`).
- **Module resolution** — Root `package.json` includes backend deps (`pg`, `sequelize`, `express`, etc.) so `@vercel/node` builder can resolve them. The handler (`vercel-backend.js`) is at the project root, NOT inside `backend/`, so `@vercel/node` installs deps from root `package.json`.
- **No `"root": "backend"` in vercel.json** — The backend service config must NOT have a `"root"` field; the entrypoint is `vercel-backend.js` at the project root.
- **Explicit `require('pg')` and `require('pg-hstore')`** — Sequelize loads dialect packages dynamically (by string), which `@vercel/ncc` cannot trace. The handler must explicitly require these packages so ncc includes them in the bundle.
- **No `server.js`** — Backend runs as serverless function, not a long-running server.
- **Install lockfile consistency** — Always run `npm install` and commit the updated `package-lock.json` after modifying `package.json`.
- **No helmet** — `helmet` calls `ServerResponse.removeHeader()` which crashes on Vercel's serverless response object. Conditionally skip via `if (!process.env.VERCEL)`.
- **No morgan** — `morgan` needs `req.socket.remoteAddress` which may not be available on Vercel. Conditionally skip.
- **No express.static for uploads** — Vercel filesystem is read-only. Skip upload static file serving.
- **No swagger-ui-express** — Swagger UI not needed on Vercel serverless. Conditionally skip.
- **dotenv path** — Always use `dotenv.config({ path: require('path').resolve(__dirname, '../../.env') })` with explicit absolute paths, not relative CWD-based paths.
