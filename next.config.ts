import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["pdf-parse"],
  turbopack: {
    resolveAlias: {
      canvas: { browser: "./lib/empty-module.ts", default: "./lib/empty-module.ts" },
      encoding: { browser: "./lib/empty-module.ts", default: "./lib/empty-module.ts" },
    },
  },
};

export default nextConfig;
