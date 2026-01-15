import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  basePath: '',
  output: 'standalone',// 输出独立目录，包含所有依赖
};

export default nextConfig;
