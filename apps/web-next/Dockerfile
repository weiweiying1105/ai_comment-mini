FROM node:20-alpine AS deps
WORKDIR /app
RUN apk add --no-cache openssl libc6-compat
RUN corepack enable && corepack prepare pnpm@9.0.0 --activate

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/web-next/package.json apps/web-next/package.json

RUN pnpm config set node-linker hoisted
RUN --mount=type=cache,id=pnpm-store,target=/root/.local/share/pnpm/store \
    pnpm --filter web-next... install --frozen-lockfile

FROM node:20-alpine AS builder
WORKDIR /app
RUN apk add --no-cache openssl libc6-compat
RUN corepack enable && corepack prepare pnpm@9.0.0 --activate

COPY --from=deps /app/node_modules /app/node_modules
COPY . .

WORKDIR /app/apps/web-next
RUN pnpm prisma generate
RUN pnpm build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
RUN apk add --no-cache openssl libc6-compat

# standalone 产物
COPY --from=builder /app/apps/web-next/.next/standalone ./
COPY --from=builder /app/apps/web-next/.next/static ./.next/static
COPY --from=builder /app/apps/web-next/public ./public

EXPOSE 8000
ENV PORT=8000
CMD ["node", "server.js"]
