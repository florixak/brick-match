import {
  type ThemesApiResponse,
  ThemesApiResponseSchema,
} from "@lego-matcher/shared-types"
import { queryOptions, useQuery } from "@tanstack/react-query"
import { apiFetch } from "@/lib/api/client"
import { queryKeys } from "@/lib/queries/keys"

const THEMES_STALE_TIME = 3_600_000

export async function fetchCatalogThemes(): Promise<ThemesApiResponse> {
  return apiFetch("/api/v1/catalog/themes", {
    schema: ThemesApiResponseSchema,
  })
}

export function catalogThemesQueryOptions() {
  return queryOptions({
    queryKey: queryKeys.catalog.themes(),
    queryFn: fetchCatalogThemes,
    staleTime: THEMES_STALE_TIME,
  })
}

export function useCatalogColors() {
  return useQuery(catalogThemesQueryOptions())
}
