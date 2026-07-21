import {
  type PartCategoriesApiResponse,
  PartCategoriesApiResponseSchema,
} from "@lego-matcher/shared-types"
import { queryOptions, useQuery } from "@tanstack/react-query"
import { apiFetch } from "@/lib/api/client"
import { queryKeys } from "@/lib/queries/keys"

const PART_CATEGORIES_STALE_TIME = 3_600_000

export async function fetchCatalogPartCategories(): Promise<PartCategoriesApiResponse> {
  return apiFetch("/api/v1/catalog/part-categories", {
    schema: PartCategoriesApiResponseSchema,
  })
}

export function catalogPartCategoriesQueryOptions() {
  return queryOptions({
    queryKey: queryKeys.catalog.partCategories(),
    queryFn: fetchCatalogPartCategories,
    staleTime: PART_CATEGORIES_STALE_TIME,
  })
}

export function useCatalogPartCategories() {
  return useQuery(catalogPartCategoriesQueryOptions())
}
