import type { GetMatchesQuery } from "@lego-matcher/shared-types"
import { debounce, parseAsFloat, parseAsInteger } from "nuqs"
import { SEARCH_DEBOUNCE_MS } from "@/constants"

export const matchingSearchParams = {
  /** Fraction 0–1, matches the backend field directly */
  minMatchPercentage: parseAsFloat.withDefault(0).withOptions({
    limitUrlUpdates: debounce(SEARCH_DEBOUNCE_MS),
  }),
  limit: parseAsInteger.withDefault(50),
  themeId: parseAsInteger,
}

export type MatchingSearchParams = {
  minMatchPercentage: number
  limit: number
  themeId: number | null
}

export function toMatchesQuery(params: MatchingSearchParams): GetMatchesQuery {
  return {
    limit: params.limit,
    ...(params.minMatchPercentage > 0 && {
      minMatchPercentage: params.minMatchPercentage,
    }),
    ...(params.themeId != null && { themeId: params.themeId }),
  }
}

export function matchesQueryEqual(
  a: GetMatchesQuery,
  b: GetMatchesQuery,
): boolean {
  return (
    a.limit === b.limit &&
    (a.minMatchPercentage ?? undefined) ===
      (b.minMatchPercentage ?? undefined) &&
    (a.themeId ?? undefined) === (b.themeId ?? undefined)
  )
}
