import type { Theme } from "@lego-matcher/shared-types"
import {
  BoxIcon,
  HomeIcon,
  type LucideIcon,
  PackageIcon,
  PuzzleIcon,
  SearchIcon,
  UserIcon,
} from "lucide-react"
import type { UrlObject } from "url"

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
    icon: BoxIcon,
  },
  {
    label: "Matching",
    href: {
      pathname: "/matching",
    },
    icon: PuzzleIcon,
  },
]

export const MOBILE_NAV_LINKS: NavLink[] = [
  ...NAV_LINKS,
  {
    label: "Me",
    href: {
      pathname: "/me",
    },
    icon: UserIcon,
  },
]

export const SEARCH_DEBOUNCE_MS = 500

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
]

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
