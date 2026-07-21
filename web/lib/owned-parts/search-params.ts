import type { GetOwnedPartsQuery } from "@lego-matcher/shared-types"
import { parseAsInteger, parseAsString } from "nuqs"

export const ownedPartsSearchParams = {
  search: parseAsString.withDefault(""),
  page: parseAsInteger.withDefault(1),
  pageSize: parseAsInteger.withDefault(50),
  colorId: parseAsInteger,
  themeId: parseAsInteger,
}

export type OwnedPartsSearchParams = {
  search: string
  page: number
  pageSize: number
  colorId: number | null
  themeId: number | null
}

export function toOwnedPartsQuery(
  params: OwnedPartsSearchParams,
): GetOwnedPartsQuery {
  return {
    page: params.page,
    pageSize: params.pageSize,
    ...(params.search.trim() && { search: params.search.trim() }),
    ...(params.colorId != null && { colorId: params.colorId }),
  }
}
