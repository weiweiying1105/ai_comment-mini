

FROM node:20-alpine AS deps
WORKDIR /app

# 安装必要的系统库以支持Prisma引擎
RUN apk add --no-cache openssl-dev libc6-compat

RUN corepack enable && corepack prepare pnpm@9.0.0 --activate

# 设置环境变量以帮助Prisma识别OpenSSL版本
ENV PRISMA_SCHEMA_ENGINE_BINARY_TARGET=linux-musl
ENV PRISMA_QUERY_ENGINE_BINARY_TARGET=linux-musl
ENV PRISMA_QUERY_ENGINE_TYPE=binary

# 预先安装依赖以利用Docker缓存
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/web-next/package.json apps/web-next/package.json

# 关键：强制生成 node_modules
RUN pnpm config set node-linker hoisted
RUN pnpm install --frozen-lockfile


FROM node:20-alpine AS builder
WORKDIR /app

# 安装必要的系统库以支持Prisma引擎
RUN apk add --no-cache openssl-dev libc6-compat

# 设置环境变量以帮助Prisma识别OpenSSL版本
ENV PRISMA_SCHEMA_ENGINE_BINARY_TARGET=linux-musl
ENV PRISMA_QUERY_ENGINE_BINARY_TARGET=linux-musl
ENV PRISMA_QUERY_ENGINE_TYPE=binary

RUN corepack enable && corepack prepare pnpm@9.0.0 --activate
COPY --from=deps /app/node_modules /app/node_modules
COPY . .

# 确保在构建前再次运行prisma generate
RUN cd apps/web-next && pnpm prisma generate
RUN cd apps/web-next && pnpm build
RUN ls -la apps/web-next/.next

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=8000

# 安装必要的系统库以支持Prisma引擎
RUN apk add --no-cache openssl-dev libc6-compat

# 设置环境变量以帮助Prisma识别OpenSSL版本
ENV PRISMA_SCHEMA_ENGINE_BINARY_TARGET=linux-musl
ENV PRISMA_QUERY_ENGINE_BINARY_TARGET=linux-musl
ENV PRISMA_QUERY_ENGINE_TYPE=binary

RUN corepack enable && corepack prepare pnpm@9.0.0 --activate

# 只带 runtime 需要的最小产物
COPY --from=builder /app/apps/web-next/.next/standalone ./
COPY --from=builder /app/apps/web-next/.next/static ./.next/static
COPY --from=builder /app/apps/web-next/public ./public

EXPOSE 8000
CMD ["node", "apps/web-next/.next/server.js"]

# 目标目录：/

# Dockerfile 名称：apps/web-next/Dockerfile

# 服务端口：8000（并且 start 用 -p 8000）
