import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // better-sqlite3 是原生模块，必须排除在打包外部依赖之外，避免被 webpack/turbopack 误处理
  serverExternalPackages: ["better-sqlite3"],
};

export default nextConfig;
