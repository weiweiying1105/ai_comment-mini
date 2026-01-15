FROM node:20-alpine AS deps
WORKDIR /app

RUN corepack enable && corepack prepare pnpm@9.0.0 --activate


COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/web-next/package.json apps/web-next/package.json

# 关键：强制生成 node_modules
RUN pnpm config set node-linker hoisted
RUN pnpm install 


FROM node:20-alpine AS builder
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@9.0.0 --activate

COPY --from=deps /app/node_modules /app/node_modules
COPY . .

# 生成适用于Linux环境的Prisma客户端
RUN pnpm --filter web-next prisma generate
# 构建应用
RUN pnpm --filter web-next build
# 确保Prisma引擎文件被复制到Next.js输出目录
RUN ls -la node_modules/@prisma/engines/
RUN cp -r node_modules/@prisma/engines/* apps/web-next/.next/server/ || echo "Engines not found in expected location"
RUN ls -la apps/web-next/.next/server/ || echo "Server dir not found"


FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

RUN corepack enable && corepack prepare pnpm@9.0.0 --activate

# 只拷贝运行需要的文件
COPY --from=builder /app/apps/web-next/.next ./.next
COPY --from=builder /app/apps/web-next/public ./public
COPY --from=builder /app/apps/web-next/package.json ./package.json
COPY --from=builder /app/node_modules ./node_modules

EXPOSE 8000
CMD ["pnpm", "start"]


# 目标目录：/

# Dockerfile 名称：apps/web-next/Dockerfile

# 服务端口：8000（并且 start 用 -p 8000）
