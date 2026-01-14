FROM node:18-alpine AS builder

WORKDIR /app

# 1. 先拷贝 workspace 相关文件
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

# 2. 启用 pnpm
RUN corepack enable

# 3. 安装全部依赖
RUN pnpm install --frozen-lockfile

# 4. 再拷贝源码
COPY apps ./apps

# 5. 构建指定子项目
WORKDIR /app/apps/web-next
RUN pnpm build

# =========================

FROM node:18-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

COPY --from=builder /app/apps/web-next ./

EXPOSE 3000
CMD ["pnpm", "start"]
