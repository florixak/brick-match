"use client"

import type { GetOwnedPartsApiResponse } from "@lego-matcher/shared-types"
import { useQueryStates } from "nuqs"
import { Fragment, useMemo } from "react"
import Pagination from "@/components/layout/pagination"
import CategoryHeader from "@/components/owned-parts/category-header"
import ListEmpty from "@/components/owned-parts/list-empty"
import ListHeader from "@/components/owned-parts/list-header"
import OwnedPart from "@/components/owned-parts/owned-part"
import { AsyncQueryState } from "@/components/query/async-query-state"
import OwnedPartsListSkeleton from "@/components/skeletons/owned-parts-list"
import { Button } from "@/components/ui/button"
import { SEARCH_DEBOUNCE_MS } from "@/constants"
import { useDebouncedValue } from "@/hooks/use-debounced-value"
import {
  ownedPartsSearchParams,
  toOwnedPartsQuery,
} from "@/lib/owned-parts/search-params"
import {
  useCatalogColors,
  useCatalogPartCategories,
  useOwnedParts,
} from "@/lib/queries"

function isEmptyOwnedParts(data: GetOwnedPartsApiResponse) {
  return data.data.items.length === 0
}

const List = () => {
  const [queryParams, setQueryParams] = useQueryStates(ownedPartsSearchParams)
  const colors = useCatalogColors()
  const partCategories = useCatalogPartCategories()

  const debouncedSearch = useDebouncedValue(
    queryParams.search,
    SEARCH_DEBOUNCE_MS,
  )
  const query = toOwnedPartsQuery({
    ...queryParams,
    search: debouncedSearch,
  })
  const ownedParts = useOwnedParts(query)

  const activeFilters = useMemo(() => {
    const filters: { label: string; onClear: () => void }[] = []

    if (queryParams.colorId != null) {
      const colorName =
        colors.data?.data.colors.find(
          (color) => color.colorId === queryParams.colorId,
        )?.name ?? `Color ${queryParams.colorId}`

      filters.push({
        label: colorName,
        onClear: () => {
          void setQueryParams({ colorId: null, page: 1 })
        },
      })
    }

    if (queryParams.partCategoryId != null) {
      const categoryName =
        partCategories.data?.data.partCategories.find(
          (category) => category.id === queryParams.partCategoryId,
        )?.name ?? `Category ${queryParams.partCategoryId}`

      filters.push({
        label: categoryName,
        onClear: () => {
          void setQueryParams({ partCategoryId: null, page: 1 })
        },
      })
    }

    if (queryParams.search.trim()) {
      filters.push({
        label: `"${queryParams.search.trim()}"`,
        onClear: () => {
          void setQueryParams({ search: "", page: 1 })
        },
      })
    }

    return filters
  }, [
    colors.data,
    partCategories.data,
    queryParams.colorId,
    queryParams.partCategoryId,
    queryParams.search,
    setQueryParams,
  ])

  const hasFilters =
    queryParams.search.trim().length > 0 ||
    queryParams.colorId != null ||
    queryParams.partCategoryId != null

  return (
    <AsyncQueryState
      isLoading={ownedParts.isPending}
      isFetching={ownedParts.isFetching}
      isError={ownedParts.isError}
      isSuccess={ownedParts.isSuccess}
      isStale={ownedParts.isStale}
      error={ownedParts.error}
      data={ownedParts.data}
      isEmpty={isEmptyOwnedParts}
      onRetry={() => void ownedParts.refetch()}
      skeleton={<OwnedPartsListSkeleton />}
      empty={<ListEmpty hasFilters={hasFilters} />}
      errorFallback={(error, retry) => (
        <div className="space-y-3 rounded-2xl border-2 border-destructive/30 bg-destructive/5 p-4">
          <p className="text-destructive text-sm">{error.message}</p>
          <Button type="button" variant="outline" size="sm" onClick={retry}>
            Try again
          </Button>
        </div>
      )}
    >
      {(data) => (
        <>
          <ListHeader
            totalItems={data.meta.totalItems}
            activeFilters={activeFilters}
          />

          <div
            className="grid gap-3"
            style={{
              gridTemplateColumns: "repeat(auto-fill, minmax(130px, 1fr))",
            }}
          >
            {data.data.items.map((part, index) => {
              const previousPart = index > 0 ? data.data.items[index - 1] : null
              const showCategoryHeader =
                queryParams.partCategoryId == null &&
                part.partCategoryName !== previousPart?.partCategoryName

              return (
                <Fragment key={`${part.partNum}-${part.colorId}`}>
                  {showCategoryHeader ? (
                    <CategoryHeader name={part.partCategoryName} />
                  ) : null}
                  <OwnedPart part={part} />
                </Fragment>
              )
            })}
          </div>

          <Pagination
            page={data.meta.page}
            totalPages={data.meta.totalPages}
            ariaLabel="Owned parts pagination"
          />
        </>
      )}
    </AsyncQueryState>
  )
}

export default List
