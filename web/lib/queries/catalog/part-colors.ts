import {
  type PartColorsApiResponse,
  PartColorsApiResponseSchema,
} from "@lego-matcher/shared-types"
import { queryOptions, useQuery } from "@tanstack/react-query"
import { apiFetch } from "@/lib/api/client"
import { queryKeys } from "@/lib/queries/keys"

const PART_COLORS_STALE_TIME = 3_600_000

export async function fetchCatalogPartColors(
  partNum: string,
): Promise<PartColorsApiResponse> {
  return apiFetch(
    `/api/v1/catalog/parts/${encodeURIComponent(partNum)}/colors`,
    {
      schema: PartColorsApiResponseSchema,
    },
  )
}

export function catalogPartColorsQueryOptions(partNum: string) {
  return queryOptions({
    queryKey: queryKeys.catalog.partColors(partNum),
    queryFn: () => fetchCatalogPartColors(partNum),
    staleTime: PART_COLORS_STALE_TIME,
  })
}

export function useCatalogPartColors(partNum: string | null) {
  return useQuery({
    ...catalogPartColorsQueryOptions(partNum ?? ""),
    enabled: partNum !== null,
  })
}
