# ========== deps: 安装依赖 ==========
FROM node:18-alpine AS deps
WORKDIR /app

# 启用 pnpm（corepack）
RUN corepack enable && corepack prepare pnpm@9.0.0 --activate

# 先拷贝依赖相关文件，利用缓存
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

# 拷贝子项目 package.json（让 pnpm 识别 workspace）
COPY apps/web-next/package.json ./apps/web-next/package.json

# 安装 workspace 依赖
RUN pnpm install --frozen-lockfile

# ========== builder: 构建 ==========
FROM node:18-alpine AS builder
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@9.0.0 --activate

# 复制依赖和源码
COPY --from=deps /app/node_modules /app/node_modules
COPY . .

# 构建指定子项目（关键：用 filter）
RUN pnpm --filter web-next build

# ========== runner: 运行 ==========
FROM node:18-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

# 拷贝构建结果到运行镜像
COPY --from=builder /app/apps/web-next/.next ./.next
COPY --from=builder /app/apps/web-next/public ./public
COPY --from=builder /app/apps/web-next/package.json ./package.json
COPY --from=builder /app/apps/web-next/next.config.ts ./next.config.ts

# 安装生产依赖
RUN pnpm install --prod --frozen-lockfile

EXPOSE 3000

# 运行
CMD ["pnpm", "start"]
