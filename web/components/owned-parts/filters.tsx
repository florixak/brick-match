"use client"

import { useQueryStates } from "nuqs"
import { AsyncQueryState } from "@/components/query/async-query-state"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import SearchableSelect from "@/components/ui/searchable-select"
import { ownedPartsSearchParams } from "@/lib/owned-parts/search-params"
import { toColorOptions, toPartCategoryOptions } from "@/lib/owned-parts/utils"
import { useCatalogColors, useCatalogPartCategories } from "@/lib/queries"
import FilterSelect from "../skeletons/filter-select"

export const labelClassName =
  "text-xs font-black uppercase tracking-wide text-muted-foreground"

function filterSelectErrorFallback(error: Error, retry: () => void) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className={labelClassName}>Filter unavailable</span>
      <div className="flex flex-col gap-2 rounded-lg border border-destructive/30 bg-destructive/5 p-2">
        <p className="text-destructive text-xs">{error.message}</p>
        <Button type="button" variant="outline" size="sm" onClick={retry}>
          Try again
        </Button>
      </div>
    </div>
  )
}

const Filters = () => {
  const [queryParams, setQueryParams] = useQueryStates(ownedPartsSearchParams)
  const colors = useCatalogColors()
  const partCategories = useCatalogPartCategories()

  return (
    <div className="mb-6 flex flex-col gap-4">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <div className="flex flex-col gap-1.5 sm:col-span-2 lg:col-span-1">
          <label htmlFor="owned-parts-search" className={labelClassName}>
            Search
          </label>
          <Input
            id="owned-parts-search"
            type="search"
            placeholder="Part name or number…"
            value={queryParams.search}
            onChange={(event) => {
              void setQueryParams({
                search: event.target.value,
                page: 1,
              })
            }}
            className="font-semibold"
          />
        </div>

        <AsyncQueryState
          isLoading={colors.isPending}
          isFetching={colors.isFetching}
          isError={colors.isError}
          isSuccess={colors.isSuccess}
          isStale={colors.isStale}
          error={colors.error}
          data={colors.data}
          onRetry={() => void colors.refetch()}
          skeleton={<FilterSelect label="Color" />}
          errorFallback={filterSelectErrorFallback}
        >
          {(data) => (
            <SearchableSelect
              id="owned-parts-color"
              label="Color"
              placeholder="All colors"
              emptyMessage="No colors found."
              value={queryParams.colorId}
              onValueChange={(colorId) => {
                void setQueryParams({ colorId, page: 1 })
              }}
              options={toColorOptions(data)}
            />
          )}
        </AsyncQueryState>

        <AsyncQueryState
          isLoading={partCategories.isPending}
          isFetching={partCategories.isFetching}
          isError={partCategories.isError}
          isSuccess={partCategories.isSuccess}
          isStale={partCategories.isStale}
          error={partCategories.error}
          data={partCategories.data}
          onRetry={() => void partCategories.refetch()}
          skeleton={<FilterSelect label="Category" />}
          errorFallback={filterSelectErrorFallback}
        >
          {(data) => (
            <SearchableSelect
              id="owned-parts-category"
              label="Category"
              placeholder="All categories"
              emptyMessage="No categories found."
              value={queryParams.partCategoryId}
              onValueChange={(partCategoryId) => {
                void setQueryParams({ partCategoryId, page: 1 })
              }}
              options={toPartCategoryOptions(data)}
            />
          )}
        </AsyncQueryState>
      </div>

      <div className="flex flex-wrap items-end gap-3">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="owned-parts-page" className={labelClassName}>
            Page
          </label>
          <Input
            id="owned-parts-page"
            type="number"
            min={1}
            value={queryParams.page}
            onChange={(event) => {
              const page = Number.parseInt(event.target.value, 10)
              if (!Number.isNaN(page) && page >= 1) {
                void setQueryParams({ page })
              }
            }}
            className="w-24 font-semibold"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="owned-parts-page-size" className={labelClassName}>
            Page size
          </label>
          <Input
            id="owned-parts-page-size"
            type="number"
            min={1}
            max={200}
            value={queryParams.pageSize}
            onChange={(event) => {
              const pageSize = Number.parseInt(event.target.value, 10)
              if (!Number.isNaN(pageSize) && pageSize >= 1 && pageSize <= 200) {
                void setQueryParams({ pageSize, page: 1 })
              }
            }}
            className="w-24 font-semibold"
          />
        </div>

        <Button
          variant="outline"
          onClick={() => {
            void setQueryParams({
              search: "",
              colorId: null,
              partCategoryId: null,
              page: 1,
              pageSize: 50,
            })
          }}
        >
          Reset filters
        </Button>
      </div>
    </div>
  )
}

export default Filters
