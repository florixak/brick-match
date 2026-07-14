export const RATE_LIMITS = {
  default: { ttl: 60_000, limit: 100 },
  auth: { ttl: 60_000, limit: 5 },
  matching: { ttl: 60_000, limit: 20 },
} as const;
