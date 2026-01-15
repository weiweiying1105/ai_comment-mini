# syntax=docker/dockerfile:1.6

FROM node:20-alpine AS deps
WORKDIR /app
RUN apk add --no-cache openssl libc6-compat
ENV CI=true
RUN corepack enable && corepack prepare pnpm@9.0.0 --activate

# 只拷贝依赖相关文件，最大化缓存命中
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/web-next/package.json apps/web-next/package.json

# 安装依赖：尽量离线优先 + 缓存 pnpm store
RUN pnpm config set node-linker hoisted
RUN --mount=type=cache,id=pnpm-store,target=/root/.local/share/pnpm/store \
    pnpm --filter web-next... install --frozen-lockfile --prefer-offline

FROM node:20-alpine AS builder
WORKDIR /app
RUN apk add --no-cache openssl libc6-compat
ENV CI=true
RUN corepack enable && corepack prepare pnpm@9.0.0 --activate

COPY --from=deps /app/node_modules /app/node_modules

# 这里会导致缓存失效，但必须拷源码；靠 .dockerignore 把体积压下去
COPY . .

# 进入子项目构建，确保 .next 生成位置固定
WORKDIR /app/apps/web-next

# Prisma：务必在 schema.prisma 里加 binaryTargets（见下文②）
RUN pnpm prisma generate

# Next build：产出 standalone
RUN pnpm build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=8000
RUN apk add --no-cache openssl libc6-compat

# 只带 runtime 需要的最小产物
COPY --from=builder /app/apps/web-next/.next/standalone ./
COPY --from=builder /app/apps/web-next/.next/static ./.next/static
COPY --from=builder /app/apps/web-next/public ./public

EXPOSE 8000
CMD ["node", "server.js"]

# 目标目录：/

# Dockerfile 名称：apps/web-next/Dockerfile

# 服务端口：8000（并且 start 用 -p 8000）
