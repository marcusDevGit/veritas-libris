# Build stage (contexto na raiz do monorepo)
FROM node:22-alpine AS builder
WORKDIR /app

COPY package.json package-lock.json tsconfig.base.json ./
COPY packages/shared/package.json packages/shared/
COPY apps/api/package.json apps/api/

RUN npm ci --workspace=@app/shared --workspace=@app/api --include-workspace-root

COPY packages/shared ./packages/shared
COPY apps/api ./apps/api

RUN npm run build --workspace=@app/shared && npm run build --workspace=@app/api

# Production stage
FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3333

COPY package.json package-lock.json ./
COPY packages/shared/package.json packages/shared/
COPY apps/api/package.json apps/api/

RUN npm ci --omit=dev --workspace=@app/shared --workspace=@app/api --include-workspace-root

COPY --from=builder /app/packages/shared/dist ./packages/shared/dist
COPY --from=builder /app/apps/api/dist ./apps/api/dist

EXPOSE 3333

CMD ["node", "apps/api/dist/server.js"]
