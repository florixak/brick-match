import {
  type SearchSetsApiResponse,
  SearchSetsApiResponseSchema,
  type SearchSetsQuery,
} from "@lego-matcher/shared-types"
import { queryOptions, useQuery } from "@tanstack/react-query"
import { apiFetch } from "@/lib/api/client"
import { queryKeys } from "@/lib/queries/keys"

const SEARCH_STALE_TIME = 300_000
const MIN_SEARCH_LENGTH = 2

export async function fetchCatalogSets(
  query: SearchSetsQuery,
): Promise<SearchSetsApiResponse> {
  return apiFetch("/api/v1/catalog/sets", {
    schema: SearchSetsApiResponseSchema,
    searchParams: query,
  })
}

export function catalogSetsQueryOptions(query: SearchSetsQuery) {
  const search = query.search?.trim() ?? ""

  return queryOptions({
    queryKey: queryKeys.catalog.sets(query),
    queryFn: () => fetchCatalogSets(query),
    staleTime: SEARCH_STALE_TIME,
    enabled: search.length >= MIN_SEARCH_LENGTH,
  })
}

export function useCatalogSets(query: SearchSetsQuery) {
  return useQuery(catalogSetsQueryOptions(query))
}
