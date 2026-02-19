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

  // Only upload source maps when the auth token is available (skips on Railway if not set)
  sourcemaps: {
    disable: !process.env.SENTRY_AUTH_TOKEN,
  },

  // Sentry org + project (from sentry.io → Settings → Projects)
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
});
