import type { UrlObject } from "node:url"
import type { Theme } from "@lego-matcher/shared-types"
import {
  type LucideIcon,
  PackageIcon,
  PuzzleIcon,
  SearchIcon,
  ZapIcon,
} from "lucide-react"

type NavLink = {
  label: string
  href: UrlObject
  icon: LucideIcon
}

export const NAV_LINKS: NavLink[] = [
  {
    label: "Search",
    href: {
      pathname: "/",
    },
    icon: SearchIcon,
  },
  {
    label: "My Parts",
    href: {
      pathname: "/owned-parts",
    },
    icon: PuzzleIcon,
  },
  {
    label: "Matching",
    href: {
      pathname: "/matching",
    },
    icon: ZapIcon,
  },
]

export const MOBILE_NAV_LINKS: NavLink[] = [...NAV_LINKS]

export const CATALOG_SEARCH_DEBOUNCE_MS = 750
export const FILTER_DEBOUNCE_MS = 450

export const TIPS_COUNT = 6

export const SEARCH_OPTIONS = [
  {
    label: "Sets",
    value: "sets",
    icon: PackageIcon,
  },
  {
    label: "Parts",
    value: "parts",
    icon: PuzzleIcon,
  },
] as const

export const FALLBACK_TIPS: Theme[] = [
  {
    id: 1,
    name: "Ninjago",
    parentId: null,
  },
  {
    id: 2,
    name: "Star Wars",
    parentId: null,
  },
  {
    id: 3,
    name: "City",
    parentId: null,
  },
  {
    id: 4,
    name: "Ideas",
    parentId: null,
  },
  {
    id: 5,
    name: "Power Miners",
    parentId: null,
  },
  {
    id: 6,
    name: "Bionicle",
    parentId: null,
  },
]

export const PAGE_SIZE_OPTIONS = [25, 50, 100, 200] as const
