import type { GetOwnedPartsQuery } from "@lego-matcher/shared-types"
import { createParser, debounce, parseAsInteger, parseAsString } from "nuqs"
import { PAGE_SIZE_OPTIONS, SEARCH_DEBOUNCE_MS } from "@/constants"

export const DEFAULT_OWNED_PARTS_PAGE_SIZE = 50

const parseAsOwnedPartsPageSize = createParser({
  parse(query) {
    const parsed = Number.parseInt(query, 10)
    if (
      Number.isNaN(parsed) ||
      !(PAGE_SIZE_OPTIONS as readonly number[]).includes(parsed)
    ) {
      return null
    }
    return parsed
  },
  serialize(value) {
    return String(value)
  },
}).withDefault(DEFAULT_OWNED_PARTS_PAGE_SIZE)

export const ownedPartsSearchParams = {
  search: parseAsString
    .withDefault("")
    .withOptions({ limitUrlUpdates: debounce(SEARCH_DEBOUNCE_MS) }),
  page: parseAsInteger.withDefault(1),
  pageSize: parseAsOwnedPartsPageSize,
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
