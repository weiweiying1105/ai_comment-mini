# ========== deps: 安装依赖 ==========
FROM node:20-alpine AS deps
WORKDIR /app

# 启用 pnpm（corepack）
RUN corepack enable && corepack prepare pnpm@9.0.0 --activate

# 先拷贝依赖相关文件，利用缓存
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

# 拷贝子项目 package.json（让 pnpm 识别 workspace）
COPY apps/web-next/package.json ./apps/web-next/package.json

# 关键：强制生成 node_modules
RUN pnpm config set node-linker hoisted

# 安装 workspace 依赖
RUN pnpm install --frozen-lockfile

# ========== builder: 构建 ==========
FROM node:20-alpine AS builder
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@9.0.0 --activate

# 复制依赖和源码
COPY --from=deps /app/node_modules /app/node_modules
COPY . .

# 构建指定子项目（关键：用 filter）
RUN pnpm --filter web-next build

# ========== runner: 运行 ==========
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

RUN corepack enable && corepack prepare pnpm@9.0.0 --activate

# 只拷贝运行需要的文件
COPY --from=builder /app/apps/web-next/.next ./.next
COPY --from=builder /app/apps/web-next/public ./public
COPY --from=builder /app/apps/web-next/package.json ./package.json

# 生产依赖（同样强制 node_modules）
RUN pnpm config set node-linker hoisted
RUN pnpm install --prod --frozen-lockfile

EXPOSE 8000
CMD ["pnpm", "start"]