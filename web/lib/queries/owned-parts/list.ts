import {
  type GetOwnedPartsApiResponse,
  GetOwnedPartsApiResponseSchema,
  type GetOwnedPartsQuery,
} from "@lego-matcher/shared-types"
import { keepPreviousData, queryOptions, useQuery } from "@tanstack/react-query"
import { apiFetch } from "@/lib/api/client"
import { queryKeys } from "@/lib/queries/keys"

const OWNED_PARTS_STALE_TIME = 30_000

export async function fetchOwnedParts(
  query: GetOwnedPartsQuery,
): Promise<GetOwnedPartsApiResponse> {
  return apiFetch("/api/v1/owned-parts", {
    schema: GetOwnedPartsApiResponseSchema,
    searchParams: query,
  })
}

export function ownedPartsQueryOptions(query: GetOwnedPartsQuery) {
  return queryOptions({
    queryKey: queryKeys.ownedParts.list(query),
    queryFn: () => fetchOwnedParts(query),
    staleTime: OWNED_PARTS_STALE_TIME,
    placeholderData: keepPreviousData,
  })
}

export function useOwnedParts(query: GetOwnedPartsQuery) {
  return useQuery(ownedPartsQueryOptions(query))
}
