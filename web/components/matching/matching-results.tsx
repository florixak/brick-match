"use client"

import { useQueryStates } from "nuqs"
import { AsyncQueryState } from "@/components/query/async-query-state"
import MatchingResultsSkeleton from "@/components/skeletons/matching-results"
import {
  matchingSearchParams,
  toMatchesQuery,
} from "@/lib/matching/search-params"
import { useMatches } from "@/lib/queries"
import MatchingResult from "./matching-result"

const MatchingResults = () => {
  const [queryParams] = useQueryStates(matchingSearchParams)
  const query = toMatchesQuery(queryParams)
  const matches = useMatches(query, queryParams.triggered)

  if (!queryParams.triggered) return null

  return (
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
  )
}

export default MatchingResults
