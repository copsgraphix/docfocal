import { log } from "@logtail/next";

// Re-export for use throughout the app
export { log };

// Typed helpers
export const logger = {
  info: (message: string, fields?: Record<string, unknown>) =>
    log.info(message, fields),
  warn: (message: string, fields?: Record<string, unknown>) =>
    log.warn(message, fields),
  error: (message: string, fields?: Record<string, unknown>) =>
    log.error(message, fields),
};
