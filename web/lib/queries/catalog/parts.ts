import {
  type SearchPartsApiResponse,
  SearchPartsApiResponseSchema,
  type SearchPartsQuery,
} from "@lego-matcher/shared-types"
import { queryOptions, useQuery } from "@tanstack/react-query"
import { apiFetch } from "@/lib/api/client"
import { queryKeys } from "@/lib/queries/keys"

const SEARCH_STALE_TIME = 300_000
const MIN_SEARCH_LENGTH = 2

export async function fetchCatalogParts(
  query: SearchPartsQuery,
): Promise<SearchPartsApiResponse> {
  return apiFetch("/api/v1/catalog/parts", {
    schema: SearchPartsApiResponseSchema,
    searchParams: query,
  })
}

export function catalogPartsQueryOptions(
  query: SearchPartsQuery,
  enabled: boolean = true,
) {
  const search = query.search?.trim() ?? ""

  return queryOptions({
    queryKey: queryKeys.catalog.parts(query),
    queryFn: () => fetchCatalogParts(query),
    staleTime: SEARCH_STALE_TIME,
    enabled: enabled && search.length >= MIN_SEARCH_LENGTH,
  })
}

export function useCatalogParts(
  query: SearchPartsQuery,
  enabled: boolean = true,
) {
  return useQuery(catalogPartsQueryOptions(query, enabled))
}
