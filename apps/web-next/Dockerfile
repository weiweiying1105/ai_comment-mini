FROM node:20-alpine AS deps
WORKDIR /app
RUN apk add --no-cache openssl libc6-compat
RUN corepack enable && corepack prepare pnpm@9.0.0 --activate

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/web-next/package.json apps/web-next/package.json
RUN pnpm config set node-linker hoisted
RUN pnpm install

FROM node:20-alpine AS builder
WORKDIR /app
RUN apk add --no-cache openssl libc6-compat
RUN corepack enable && corepack prepare pnpm@9.0.0 --activate
COPY --from=deps /app/node_modules /app/node_modules
COPY . .

WORKDIR /app/apps/web-next
RUN pnpm prisma generate
RUN pnpm build
RUN ls -la .next

FROM node:20-alpine AS runner
WORKDIR /app/apps/web-next
ENV NODE_ENV=production
RUN apk add --no-cache openssl libc6-compat
RUN corepack enable && corepack prepare pnpm@9.0.0 --activate

COPY --from=builder /app/apps/web-next/.next ./.next
COPY --from=builder /app/apps/web-next/public ./public
COPY --from=builder /app/apps/web-next/package.json ./package.json
COPY --from=builder /app/node_modules /app/node_modules

EXPOSE 8000
CMD ["pnpm", "start"]


# 目标目录：/

# Dockerfile 名称：apps/web-next/Dockerfile

# 服务端口：8000（并且 start 用 -p 8000）
