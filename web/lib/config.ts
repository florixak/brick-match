import { env } from "./env"

export const siteConfig = {
  name: "BrickMatch",
  description:
    "A smart LEGO collection manager that helps users discover which sets they can build from the parts they already own.",
  url: env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  links: {
    website: "https://ondrejptak.dev",
    github: "https://github.com/florixak",
  },
} as const

export const authPaths = {
  login: "/login",
  register: "/register",
  defaultAuthenticated: "/owned-parts",
} as const

export type SiteConfig = typeof siteConfig
