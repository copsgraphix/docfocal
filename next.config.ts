import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";
import { withLogtail } from "@logtail/next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["pdf-parse"],
  turbopack: {
    resolveAlias: {
      canvas: { browser: "./lib/empty-module.ts", default: "./lib/empty-module.ts" },
      encoding: { browser: "./lib/empty-module.ts", default: "./lib/empty-module.ts" },
    },
  },
};

// BetterStack logging
const withLogtailConfig = withLogtail(nextConfig);

// Sentry error monitoring
export default withSentryConfig(withLogtailConfig, {
  // Suppress noisy build output
  silent: !process.env.CI,

  // Upload source maps to Sentry for readable stack traces
  widenClientFileUpload: true,

  // Automatically tree-shake Sentry logger statements
  disableLogger: true,

  // Sentry org + project (from sentry.io → Settings → Projects)
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
});
