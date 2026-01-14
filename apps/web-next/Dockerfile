# ========== deps: 安装依赖 ==========
FROM node:18-alpine AS deps
WORKDIR /app

RUN corepack enable && corepack prepare pnpm@9.0.0 --activate

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/web-next/package.json apps/web-next/package.json

RUN pnpm install --frozen-lockfile


# ========== builder: 构建 ==========
FROM node:18-alpine AS builder
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@9.0.0 --activate

COPY --from=deps /app/node_modules /app/node_modules
COPY . .

RUN pnpm --filter web-next build


# ========== runner: 运行 ==========
FROM node:18-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

# 让 runner 也能用 pnpm
RUN corepack enable && corepack prepare pnpm@9.0.0 --activate

# 只拷贝运行所需文件
COPY --from=builder /app/apps/web-next/.next ./.next
COPY --from=builder /app/apps/web-next/public ./public
COPY --from=builder /app/apps/web-next/package.json ./package.json
COPY --from=builder /app/apps/web-next/next.config.ts ./next.config.ts

# 生产依赖（注意：这里会装到 /app/node_modules）
RUN pnpm install --prod --frozen-lockfile

EXPOSE 8000
CMD ["pnpm", "start"]
