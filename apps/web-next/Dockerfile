FROM node:20-alpine AS deps
WORKDIR /app

RUN corepack enable && corepack prepare pnpm@9.0.0 --activate

# 如果仓库有 .npmrc，一定要拷（可能包含 node-linker 配置）
COPY .npmrc ./

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/web-next/package.json apps/web-next/package.json

# 关键：强制生成 node_modules
RUN pnpm config set node-linker hoisted
RUN pnpm install --frozen-lockfile


FROM node:20-alpine AS builder
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@9.0.0 --activate

COPY --from=deps /app/node_modules /app/node_modules
COPY . .

RUN pnpm --filter web-next build


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
