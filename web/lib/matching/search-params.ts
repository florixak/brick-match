import type { GetMatchesQuery } from "@lego-matcher/shared-types"
import { parseAsBoolean, parseAsFloat, parseAsInteger } from "nuqs"

export const matchingSearchParams = {
  /** Fraction 0–1, matches the backend field directly */
  minMatchPercentage: parseAsFloat.withDefault(0),
  limit: parseAsInteger.withDefault(50),
  themeId: parseAsInteger,
  /** Whether the user has clicked "Find Matching Sets" — gates query execution */
  triggered: parseAsBoolean.withDefault(false),
}

export type MatchingSearchParams = {
  minMatchPercentage: number
  limit: number
  themeId: number | null
  triggered: boolean
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
