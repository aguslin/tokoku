FROM node:22-alpine AS base
RUN corepack enable && corepack prepare pnpm@latest --activate

FROM node:18-alpine AS backend-deps
WORKDIR /app/backend
COPY backend/package.json backend/package-lock.json* ./
RUN npm ci --only=production && npm cache clean --force

FROM node:18-alpine AS backend-build
WORKDIR /app/backend
COPY backend/package.json backend/package-lock.json* ./
RUN npm ci && npm cache clean --force
COPY backend/ .

FROM base AS frontend-deps
WORKDIR /app/frontend
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile

FROM base AS frontend-builder
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
WORKDIR /app/frontend
COPY --from=frontend-deps /app/frontend/node_modules ./node_modules
COPY . .
RUN pnpm build

FROM node:18-alpine AS runner
WORKDIR /app

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 appuser

COPY --from=backend-deps /app/backend/node_modules /app/backend/node_modules
COPY --from=backend-build /app/backend /app/backend

COPY --from=frontend-builder /app/frontend/public /app/frontend/public
COPY --from=frontend-builder --chown=appuser:nodejs /app/frontend/.next/standalone /app/frontend
COPY --from=frontend-builder --chown=appuser:nodejs /app/frontend/.next/static /app/frontend/.next/static

RUN mkdir -p /app/backend/storage/uploads /app/backend/storage/logs && \
    chown -R appuser:nodejs /app

COPY --chown=appuser:nodejs start.sh /app/start.sh
RUN chmod +x /app/start.sh

USER appuser

EXPOSE 3000 5000

CMD ["/app/start.sh"]
