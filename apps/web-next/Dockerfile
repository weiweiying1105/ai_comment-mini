# ================== 构建阶段 ==================
FROM node:20-alpine AS builder

# 容器里的工作目录（和你本地无关）
WORKDIR /app

# 安装 Prisma 依赖的系统库
RUN apk add --no-cache openssl-dev libc6-compat

# 使用 pnpm
RUN corepack enable && corepack prepare pnpm@9.0.0 --activate

# 先拷贝根目录的依赖文件（注意：构建上下文是仓库根目录）
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/web-next/package.json apps/web-next/package.json

# 安装依赖（只装 web-next 相关的，利用 workspace）
RUN pnpm config set node-linker hoisted
RUN pnpm install --filter web-next... --frozen-lockfile

# 再把所有代码拷进来
COPY . .

# 进入应用目录，生成 Prisma Client + 构建 Next
WORKDIR /app/apps/web-next
RUN pnpm prisma generate
RUN pnpm build

# ================== 运行阶段 ==================
FROM node:20-alpine AS runner

# 运行时工作目录：同样用 /app
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=8000

# 安装 Prisma 运行需要的库
RUN apk add --no-cache openssl-dev libc6-compat

# 不需要在运行阶段再装依赖，只需要能用 node 即可
# 如果你想用 pnpm 启动，可以再启用 corepack：
RUN corepack enable && corepack prepare pnpm@9.0.0 --activate

# 把构建阶段的整个 /app 拷过来（简单粗暴但最稳）
COPY --from=builder /app /app

# 进入真正的应用目录
WORKDIR /app/apps/web-next

EXPOSE 8000

# 用 Next 官方推荐的方式启动生产环境
CMD ["pnpm", "start", "-p", "8000"]
# 等价于： next start -p 8000

# 目标目录：/

# Dockerfile 名称：apps/web-next/Dockerfile

# 服务端口：8000（并且 start 用 -p 8000）
