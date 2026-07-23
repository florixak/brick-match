import {
  type GetMatchesApiResponse,
  GetMatchesApiResponseSchema,
  type GetMatchesQuery,
} from "@lego-matcher/shared-types"
import { queryOptions, useQuery } from "@tanstack/react-query"
import { apiFetch } from "@/lib/api/client"
import { queryKeys } from "@/lib/queries/keys"

const MATCHES_STALE_TIME = 30_000

export async function fetchMatches(
  query: GetMatchesQuery,
): Promise<GetMatchesApiResponse> {
  return apiFetch("/api/v1/matching", {
    schema: GetMatchesApiResponseSchema,
    searchParams: query,
  })
}

export function matchesQueryOptions(query: GetMatchesQuery, enabled = true) {
  return queryOptions({
    queryKey: queryKeys.matches.list(query),
    queryFn: () => fetchMatches(query),
    staleTime: MATCHES_STALE_TIME,
    enabled,
  })
}

export function useMatches(query: GetMatchesQuery, enabled = true) {
  return useQuery(matchesQueryOptions(query, enabled))
}
