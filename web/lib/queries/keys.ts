import type {
  GetMatchesQuery,
  GetOwnedPartsQuery,
  SearchPartsQuery,
  SearchSetsQuery,
} from "@lego-matcher/shared-types"

export const queryKeys = {
  catalog: {
    all: ["catalog"] as const,
    sets: (query: SearchSetsQuery) =>
      [...queryKeys.catalog.all, "sets", query] as const,
    parts: (query: SearchPartsQuery) =>
      [...queryKeys.catalog.all, "parts", query] as const,
    colors: () => [...queryKeys.catalog.all, "colors"] as const,
    themes: () => [...queryKeys.catalog.all, "themes"] as const,
  },
  ownedParts: {
    all: ["ownedParts"] as const,
    lists: () => [...queryKeys.ownedParts.all, "list"] as const,
    list: (query: GetOwnedPartsQuery) =>
      [...queryKeys.ownedParts.lists(), query] as const,
  },
  matches: {
    all: ["matches"] as const,
    list: (query: GetMatchesQuery) =>
      [...queryKeys.matches.all, query] as const,
  },
} as const
