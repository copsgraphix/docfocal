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

// Sentry — only wrap when auth token is present (avoids build failures on Railway
// if the env var hasn't been added to the project yet)
export default process.env.SENTRY_AUTH_TOKEN
  ? withSentryConfig(withLogtailConfig, {
      silent: !process.env.CI,
      org: "docfocal-ly",
      project: "javascript-nextjs",
      sourcemaps: { disable: false },
    })
  : withLogtailConfig;
