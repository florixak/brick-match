import {
  type ColorsApiResponse,
  ColorsApiResponseSchema,
} from "@lego-matcher/shared-types"
import { queryOptions, useQuery } from "@tanstack/react-query"
import { apiFetch } from "@/lib/api/client"
import { queryKeys } from "@/lib/queries/keys"

const COLORS_STALE_TIME = 3_600_000

export async function fetchCatalogColors(): Promise<ColorsApiResponse> {
  return apiFetch("/api/v1/catalog/colors", {
    schema: ColorsApiResponseSchema,
  })
}

export function catalogColorsQueryOptions() {
  return queryOptions({
    queryKey: queryKeys.catalog.colors(),
    queryFn: fetchCatalogColors,
    staleTime: COLORS_STALE_TIME,
  })
}

export function useCatalogColors() {
  return useQuery(catalogColorsQueryOptions())
}
