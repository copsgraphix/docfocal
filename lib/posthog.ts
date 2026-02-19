import { PostHog } from "posthog-node";

// Server-side PostHog client (singleton)
let _client: PostHog | null = null;

export function getPostHogServer(): PostHog {
  if (!_client) {
    _client = new PostHog(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
      host: process.env.NEXT_PUBLIC_POSTHOG_HOST ?? "https://app.posthog.com",
      flushAt: 1,      // flush immediately in serverless
      flushInterval: 0,
    });
  }
  return _client;
}
