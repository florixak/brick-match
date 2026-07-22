"use client"

import { useQueryStates } from "nuqs"
import { useEffect, useState } from "react"
import { AsyncQueryState } from "@/components/query/async-query-state"
import { searchSurfaceClassName } from "@/components/search/search"
import { Button } from "@/components/ui/button"
import { FieldCaption, FieldLabel } from "@/components/ui/field-label"
import { Input } from "@/components/ui/input"
import SearchableSelect from "@/components/ui/searchable-select"
import { ownedPartsSearchParams } from "@/lib/owned-parts/search-params"
import { toColorOptions, toPartCategoryOptions } from "@/lib/owned-parts/utils"
import { useCatalogColors, useCatalogPartCategories } from "@/lib/queries"
import { cn } from "@/lib/utils"
import FilterSelect from "../skeletons/filter-select"

export { fieldLabelClassName as labelClassName } from "@/components/ui/field-label"

function filterSelectErrorFallback(error: Error, retry: () => void) {
  return (
    <div className="flex flex-col gap-1.5">
      <FieldCaption>Filter unavailable</FieldCaption>
      <div className="flex flex-col gap-2 rounded-lg border border-destructive/30 bg-destructive/5 p-2">
        <p className="text-destructive text-xs">{error.message}</p>
        <Button type="button" variant="outline" size="sm" onClick={retry}>
          Try again
        </Button>
      </div>
    </div>
  )
}

type BoundedNumberInputProps = {
  id: string
  label: string
  value: number
  min: number
  max?: number
  onCommit: (value: number) => void
  className?: string
}

function BoundedNumberInput({
  id,
  label,
  value,
  min,
  max,
  onCommit,
  className,
}: BoundedNumberInputProps) {
  const [inputValue, setInputValue] = useState(String(value))

  useEffect(() => {
    setInputValue(String(value))
  }, [value])

  const isValid = (parsed: number) =>
    !Number.isNaN(parsed) &&
    parsed >= min &&
    (max === undefined || parsed <= max)

  const commit = (raw: string) => {
    const parsed = Number.parseInt(raw, 10)
    if (!isValid(parsed)) {
      setInputValue(String(value))
      return
    }
    onCommit(parsed)
  }

  return (
    <div className="flex flex-col gap-1.5">
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      <Input
        id={id}
        type="number"
        min={min}
        max={max}
        value={inputValue}
        onChange={(event) => {
          const raw = event.target.value
          setInputValue(raw)
          const parsed = Number.parseInt(raw, 10)
          if (isValid(parsed)) {
            onCommit(parsed)
          }
        }}
        onBlur={() => commit(inputValue)}
        className={className}
      />
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
              triggerClassName={searchSurfaceClassName}
            />
          )}
        </AsyncQueryState>
      </div>

      <div className="flex flex-wrap items-end gap-3">
        <BoundedNumberInput
          id="owned-parts-page-size"
          label="Page size"
          value={queryParams.pageSize}
          min={1}
          max={200}
          onCommit={(pageSize) => {
            void setQueryParams({ pageSize, page: 1 })
          }}
          className={cn("w-24 font-semibold", searchSurfaceClassName)}
        />

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
