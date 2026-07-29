"use client"

import { useQueryStates } from "nuqs"
import { AsyncQueryState } from "@/components/query/async-query-state"
import { searchSurfaceClassName } from "@/components/search/search"
import { Button } from "@/components/ui/button"
import { FieldLabel } from "@/components/ui/field-label"
import { Input } from "@/components/ui/input"
import SearchableSelect from "@/components/ui/searchable-select"
import { PAGE_SIZE_OPTIONS } from "@/constants"
import { toPartCategoryOptions } from "@/lib/owned-parts/category"
import { toColorOptions } from "@/lib/owned-parts/color"
import { ownedPartsSearchParams } from "@/lib/owned-parts/search-params"
import { useCatalogColors, useCatalogPartCategories } from "@/lib/queries"
import { cn } from "@/lib/utils"
import SelectErrorFallback from "../fallbacks/select-error"
import FilterSelect from "../skeletons/filter-select"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select"

export { fieldLabelClassName as labelClassName } from "@/components/ui/field-label"

const Filters = () => {
  const [queryParams, setQueryParams] = useQueryStates(ownedPartsSearchParams)
  const colors = useCatalogColors()
  const partCategories = useCatalogPartCategories()

  return (
    <div className="mb-6 flex flex-col gap-4">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <div className="flex flex-col gap-1.5 sm:col-span-2 lg:col-span-1">
          <FieldLabel htmlFor="owned-parts-search">Search</FieldLabel>
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
            className={cn("h-9 font-semibold", searchSurfaceClassName)}
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
          errorFallback={SelectErrorFallback}
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
              triggerClassName={searchSurfaceClassName}
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
          errorFallback={SelectErrorFallback}
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
              triggerClassName={searchSurfaceClassName}
            />
          )}
        </AsyncQueryState>
      </div>

      <div className="flex flex-wrap items-end gap-3">
        <div className="flex flex-col gap-1.5">
          <FieldLabel htmlFor="owned-parts-page-size">Page size</FieldLabel>
          <Select
            value={String(queryParams.pageSize)}
            onValueChange={(value) => {
              void setQueryParams({ pageSize: Number(value), page: 1 })
            }}
          >
            <SelectTrigger
              id="owned-parts-page-size"
              className={cn("h-9 w-24 font-semibold", searchSurfaceClassName)}
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PAGE_SIZE_OPTIONS.map((size) => (
                <SelectItem key={size} value={String(size)}>
                  {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
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
