import type { Color } from "@lego-matcher/shared-types"
import { filterColorsByIds } from "@/lib/owned-parts/color"
import { useCatalogColors } from "@/lib/queries/catalog/colors"
import { useCatalogPartColors } from "@/lib/queries/catalog/part-colors"

export function usePartColorSelect(
  partNum: string | null,
  includeColorIds: readonly number[] = [],
) {
  const colors = useCatalogColors()
  const partColors = useCatalogPartColors(partNum)

  const isLoading =
    colors.isPending || (partNum !== null && partColors.isPending)
  const isFetching = colors.isFetching || partColors.isFetching
  const isError = colors.isError || partColors.isError
  const isSuccess =
    colors.isSuccess && (partNum === null || partColors.isSuccess)
  const error = colors.error ?? partColors.error ?? null

  let data: Color[] | undefined
  if (colors.data && (partNum === null || partColors.data)) {
    data =
      partNum === null
        ? colors.data
        : filterColorsByIds(colors.data, partColors.data!, includeColorIds)
  }

  const refetch = async () => {
    await Promise.all([
      colors.refetch(),
      partNum !== null ? partColors.refetch() : Promise.resolve(),
    ])
  }

  return {
    isPending: isLoading,
    isFetching,
    isError,
    isSuccess,
    isStale: colors.isStale || partColors.isStale,
    error,
    data,
    refetch,
  }
}
