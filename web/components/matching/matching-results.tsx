"use client"

import type { GetMatchesQuery } from "@lego-matcher/shared-types"
import { ZapIcon } from "lucide-react"
import { useQueryStates } from "nuqs"
import { useState } from "react"
import { AsyncQueryState } from "@/components/query/async-query-state"
import MatchingResultsSkeleton from "@/components/skeletons/matching-results"
import { Button } from "@/components/ui/button"
import {
  matchingSearchParams,
  toMatchesQuery,
} from "@/lib/matching/search-params"
import { useMatches } from "@/lib/queries"
import MatchingResult from "./matching-result"

const MatchingResults = () => {
  const [queryParams, setQueryParams] = useQueryStates(matchingSearchParams)
  const [appliedQuery, setAppliedQuery] = useState<GetMatchesQuery | null>(null)
  const matches = useMatches(
    appliedQuery ?? { limit: 50 },
    appliedQuery !== null,
  )

  const handleFindMatchingSets = () => {
    setAppliedQuery(toMatchesQuery(queryParams))
  }

  const handleResetFilters = () => {
    void setQueryParams({ minMatchPercentage: 0, themeId: null })
    setAppliedQuery(null)
  }

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <Button className="flex-1" onClick={handleFindMatchingSets}>
          <ZapIcon />
          Find Matching Sets
        </Button>

        <Button variant="outline" onClick={handleResetFilters}>
          Reset filters
        </Button>
      </div>

      {appliedQuery === null ? (
        <p className="text-sm text-muted-foreground">
          Adjust filters above, then click Find Matching Sets.
        </p>
      ) : (
        <AsyncQueryState
          isLoading={matches.isPending}
          isFetching={matches.isFetching}
          isError={matches.isError}
          isSuccess={matches.isSuccess}
          isStale={matches.isStale}
          error={matches.error}
          data={matches.data}
          onRetry={() => void matches.refetch()}
          skeleton={<MatchingResultsSkeleton />}
          isEmpty={(data) => data.data.results.length === 0}
          empty={
            <p className="text-sm text-muted-foreground">
              No matching sets found. Try lowering the minimum match percentage.
            </p>
          }
        >
          {(data) => (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {data.data.results.map((result) => (
                <MatchingResult key={result.setNum} result={result} />
              ))}
            </div>
          )}
        </AsyncQueryState>
      )}
    </section>
  )
}

export default MatchingResults
