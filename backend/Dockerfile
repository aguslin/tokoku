FROM node:18-alpine AS deps

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci && \
    npm cache clean --force

FROM node:18-alpine AS runner

WORKDIR /app

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 appuser

COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN mkdir -p storage/uploads storage/logs && \
    chown -R appuser:nodejs /app

USER appuser

EXPOSE 5000

ENV NODE_ENV=production

CMD ["node", "server.js"]
