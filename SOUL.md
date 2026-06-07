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
- Backend API handler: `backend/api/[...path].js`
- Frontend API base URL: `/_/backend/api/v1` (or `NEXT_PUBLIC_API_URL` env)

## Known Vercel Serverless Constraints

- **Read-only filesystem** — Winston file transports must be skipped (detected via `process.env.VERCEL`).
- **Module resolution** — Backend `pg`, `sequelize`, etc. must be findable. Root `package.json` includes backend deps as a workaround.
- **No `server.js`** — Backend runs as serverless function, not a long-running server.
