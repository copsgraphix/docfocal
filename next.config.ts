import type { NextConfig } from "next";

const securityHeaders = [
  { key: "X-Content-Type-Options",    value: "nosniff" },
  { key: "X-Frame-Options",           value: "DENY" },
  { key: "X-XSS-Protection",          value: "1; mode=block" },
  { key: "Referrer-Policy",           value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy",        value: "camera=(), microphone=(), geolocation=()" },
];

const nextConfig: NextConfig = {
  serverExternalPackages: ["pdf-parse"],

  async headers() {
    return [
      {
        // Apply security headers to all routes
        source: "/(.*)",
        headers: securityHeaders,
      },
    ];
  },

  turbopack: {
    resolveAlias: {
      canvas:   { browser: "./lib/empty-module.ts", default: "./lib/empty-module.ts" },
      encoding: { browser: "./lib/empty-module.ts", default: "./lib/empty-module.ts" },
    },
  },
};

export default nextConfig;
