FROM node:20-alpine AS builder
WORKDIR /app

RUN apk add --no-cache openssl libc6-compat

COPY package.json package-lock.json ./
COPY backend ./backend
COPY frontend/package.json frontend/

RUN npm ci
RUN test -e backend/node_modules/.bin/prisma
RUN npm run build -w backend

FROM node:20-alpine AS runner
WORKDIR /app

RUN apk add --no-cache openssl libc6-compat wget

ENV NODE_ENV=production
ENV PORT=3001
ENV PATH="/app/backend/node_modules/.bin:/app/node_modules/.bin:$PATH"

COPY package.json package-lock.json ./
COPY backend/package.json backend/
COPY frontend/package.json frontend/
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/backend/node_modules ./backend/node_modules
COPY --from=builder /app/backend/dist ./backend/dist
COPY --from=builder /app/backend/prisma ./backend/prisma
COPY --from=builder /app/backend/src/database/default-categories.ts ./backend/src/database/default-categories.ts
COPY backend/docker-entrypoint.sh ./backend/docker-entrypoint.sh

WORKDIR /app/backend
RUN sed -i 's/\r$//' docker-entrypoint.sh && chmod +x docker-entrypoint.sh

EXPOSE 3001

HEALTHCHECK --interval=10s --timeout=5s --start-period=25s --retries=10 \
  CMD wget -qO- http://127.0.0.1:3001/health || exit 1

ENTRYPOINT ["./docker-entrypoint.sh"]
