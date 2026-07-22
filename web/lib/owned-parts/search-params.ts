import type { GetOwnedPartsQuery } from "@lego-matcher/shared-types"
import { debounce, parseAsInteger, parseAsString } from "nuqs"
import { SEARCH_DEBOUNCE_MS } from "@/constants"

export const ownedPartsSearchParams = {
  search: parseAsString
    .withDefault("")
    .withOptions({ limitUrlUpdates: debounce(SEARCH_DEBOUNCE_MS) }),
  page: parseAsInteger.withDefault(1),
  pageSize: parseAsInteger.withDefault(50),
  colorId: parseAsInteger,
  partCategoryId: parseAsInteger,
}

export type OwnedPartsSearchParams = {
  search: string
  page: number
  pageSize: number
  colorId: number | null
  partCategoryId: number | null
}

export function toOwnedPartsQuery(
  params: OwnedPartsSearchParams,
): GetOwnedPartsQuery {
  return {
    page: params.page,
    pageSize: params.pageSize,
    ...(params.search.trim() && { search: params.search.trim() }),
    ...(params.colorId != null && { colorId: params.colorId }),
    ...(params.partCategoryId != null && {
      partCategoryId: params.partCategoryId,
    }),
  }
}
