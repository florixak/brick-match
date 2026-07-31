"use client"

import type {
  PartSummary,
  SearchPartsApiResponse,
  SearchSetsApiResponse,
  SetSummary,
} from "@lego-matcher/shared-types"
import { useQueryStates } from "nuqs"
import { useState } from "react"
import { AsyncQueryState } from "@/components/query/async-query-state"
import { Button } from "@/components/ui/button"
import { CATALOG_SEARCH_DEBOUNCE_MS } from "@/constants"
import { useDebouncedValue } from "@/hooks/use-debounced-value"
import { useCatalogParts, useCatalogSets } from "@/lib/queries"
import { catalogSearchParams } from "@/lib/search/search-params"
import { cn, formatSetNumber } from "@/lib/utils"
import PartDialog from "../dialogs/part-dialog"
import SetDialog from "../dialogs/set-dialog"
import SetAvatar from "./set-avatar"

const MIN_SEARCH_LENGTH = 2
const RESULTS_LIMIT = 20

const resultMessageClassName = "px-3 py-2 text-muted-foreground text-sm"
const resultItemClassName =
  "min-w-0 px-3 py-1 transition-colors hover:bg-muted/50 dark:hover:bg-input/30"

const resultButtonClassName =
  "h-auto min-h-0 w-full min-w-0 shrink whitespace-normal text-left px-0 py-2"

const resultTextClassName = "w-full min-w-0 text-sm wrap-break-word"

function isEmptySets(data: SearchSetsApiResponse) {
  return data.data.sets.length === 0
}

function isEmptyParts(data: SearchPartsApiResponse) {
  return data.data.parts.length === 0
}

const SearchResults = () => {
  const [queryParams] = useQueryStates(catalogSearchParams)
  const debouncedSearch = useDebouncedValue(
    queryParams.q,
    CATALOG_SEARCH_DEBOUNCE_MS,
  )
  const [selectedSet, setSelectedSet] = useState<SetSummary | null>(null)
  const [selectedPart, setSelectedPart] = useState<PartSummary | null>(null)

  const trimmedSearch = debouncedSearch.trim()
  const immediateTrimmedSearch = queryParams.q.trim()
  const query = { search: trimmedSearch, limit: RESULTS_LIMIT }
  const canQuery = trimmedSearch.length >= MIN_SEARCH_LENGTH
  const isPartsMode = queryParams.mode === "parts"

  const setsQuery = useCatalogSets(query, !isPartsMode && canQuery)
  const partsQuery = useCatalogParts(query, isPartsMode && canQuery)

  if (immediateTrimmedSearch.length < MIN_SEARCH_LENGTH) {
    return (
      <p className={resultMessageClassName}>
        Type at least {MIN_SEARCH_LENGTH} characters to search.
      </p>
    )
  }

  if (!canQuery) {
    return <p className={resultMessageClassName}>Searching…</p>
  }

  if (isPartsMode) {
    return (
      <>
        <AsyncQueryState
          isLoading={partsQuery.isPending}
          isFetching={partsQuery.isFetching}
          isError={partsQuery.isError}
          isSuccess={partsQuery.isSuccess}
          isStale={partsQuery.isStale}
          error={partsQuery.error}
          data={partsQuery.data}
          isEmpty={isEmptyParts}
          onRetry={() => void partsQuery.refetch()}
          skeleton={<p className={resultMessageClassName}>Searching…</p>}
          empty={
            <p className={resultMessageClassName}>
              No parts found for &ldquo;{trimmedSearch}&rdquo;.
            </p>
          }
          errorFallback={(error, retry) => (
            <div className="space-y-3 p-3">
              <p className="text-destructive text-sm">{error.message}</p>
              <Button type="button" variant="outline" size="sm" onClick={retry}>
                Try again
              </Button>
            </div>
          )}
        >
          {(data) => (
            <ul className="divide-y divide-border">
              {data.data.parts.map((part) => (
                <li key={part.partNum} className={resultItemClassName}>
                  <Button
                    variant="ghost"
                    onClick={() => setSelectedPart(part)}
                    className={cn(
                      resultButtonClassName,
                      "flex-col items-stretch justify-center gap-0",
                    )}
                  >
                    <span className="font-mono text-muted-foreground text-xs">
                      {part.partNum}
                    </span>
                    <span className={resultTextClassName}>{part.name}</span>
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </AsyncQueryState>
        <PartDialog
          selectedPart={selectedPart}
          setSelectedPart={setSelectedPart}
        />
      </>
    )
  }

  return (
    <>
      <AsyncQueryState
        isLoading={setsQuery.isPending}
        isFetching={setsQuery.isFetching}
        isError={setsQuery.isError}
        isSuccess={setsQuery.isSuccess}
        isStale={setsQuery.isStale}
        error={setsQuery.error}
        data={setsQuery.data}
        isEmpty={isEmptySets}
        onRetry={() => void setsQuery.refetch()}
        skeleton={<p className={resultMessageClassName}>Searching…</p>}
        empty={
          <p className={resultMessageClassName}>
            No sets found for &ldquo;{trimmedSearch}&rdquo;.
          </p>
        }
        errorFallback={(error, retry) => (
          <div className="space-y-3 p-3">
            <p className="text-destructive text-sm">{error.message}</p>
            <Button type="button" variant="outline" size="sm" onClick={retry}>
              Try again
            </Button>
          </div>
        )}
      >
        {(data) => (
          <ul className="divide-y divide-border">
            {data.data.sets.map((set) => (
              <li key={set.setNum} className={resultItemClassName}>
                <Button
                  variant="ghost"
                  onClick={() => setSelectedSet(set)}
                  className={cn(
                    resultButtonClassName,
                    "flex-row items-center justify-start gap-3",
                  )}
                >
                  <SetAvatar
                    themeId={set.themeId}
                    themeName={set.themeName}
                    setNum={set.setNum}
                    size="default"
                  />
                  <div className="flex min-w-0 flex-1 flex-col items-stretch justify-center">
                    <span className={resultTextClassName}>{set.name}</span>
                    <span className="text-muted-foreground text-xs">
                      {formatSetNumber(set.setNum)} · {set.year} ·{" "}
                      {set.numParts} parts
                    </span>
                  </div>
                </Button>
              </li>
            ))}
          </ul>
        )}
      </AsyncQueryState>
      <SetDialog selectedSet={selectedSet} setSelectedSet={setSelectedSet} />
    </>
  )
}

export default SearchResults
