import { env } from "./env";

export const siteConfig = {
  name: "My App",
  description: "A production-ready Next.js application.",
  url: env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  links: {
    github: "https://github.com/florixak",
  },
} as const;

export type SiteConfig = typeof siteConfig;
