"use client"

import { useQueryStates } from "nuqs"
import { AsyncQueryState } from "@/components/query/async-query-state"
import SearchableSelect from "@/components/ui/searchable-select"
import { matchingSearchParams } from "@/lib/matching/search-params"
import { toThemeOptions } from "@/lib/matching/utils"
import { useCatalogThemes } from "@/lib/queries"
import SelectErrorFallback from "../fallbacks/select-error"
import { searchSurfaceClassName } from "../search/search"
import FilterSelect from "../skeletons/filter-select"
import MinPercentageSlider from "./min-percentage-slider"

const Filters = () => {
  const [queryParams, setQueryParams] = useQueryStates(matchingSearchParams)
  const themes = useCatalogThemes()

  return (
    <div className="mb-6 flex flex-col gap-4">
      <div className="grid gap-8 sm:grid-cols-2">
        <MinPercentageSlider
          value={queryParams.minMatchPercentage}
          onValueChange={(minMatchPercentage) => {
            void setQueryParams({ minMatchPercentage })
          }}
        />

        <AsyncQueryState
          isLoading={themes.isPending}
          isFetching={themes.isFetching}
          isError={themes.isError}
          isSuccess={themes.isSuccess}
          isStale={themes.isStale}
          error={themes.error}
          data={themes.data}
          onRetry={() => void themes.refetch()}
          skeleton={<FilterSelect label="Theme" />}
          errorFallback={SelectErrorFallback}
        >
          {(data) => (
            <SearchableSelect
              id="matching-theme"
              label="Theme"
              placeholder="All themes"
              emptyMessage="No themes found."
              value={queryParams.themeId}
              onValueChange={(themeId) => {
                void setQueryParams({ themeId })
              }}
              options={toThemeOptions(data)}
              triggerClassName={searchSurfaceClassName}
            />
          )}
        </AsyncQueryState>
      </div>
    </div>
  )
}

export default Filters
