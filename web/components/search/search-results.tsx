"use client"

import type {
  PartSummary,
  SearchPartsApiResponse,
  SearchSetsApiResponse,
  SetSummary,
} from "@lego-matcher/shared-types"
import { useQueryState } from "nuqs"
import { useState } from "react"
import { AsyncQueryState } from "@/components/query/async-query-state"
import { Button } from "@/components/ui/button"
import { SEARCH_DEBOUNCE_MS } from "@/constants"
import { useDebouncedValue } from "@/hooks/use-debounced-value"
import { useCatalogParts, useCatalogSets } from "@/lib/queries"
import {
  formatSetNumber,
  getFirstTwoLetters,
  getThemeDotClassName,
} from "@/lib/utils"
import PartDialog from "../dialogs/part-dialog"
import SetDialog from "../dialogs/set-dialog"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog"
import SetAvatar from "./set-avatar"

const MIN_SEARCH_LENGTH = 2
const RESULTS_LIMIT = 10

const resultMessageClassName = "px-3 py-2 text-muted-foreground text-sm"
const resultItemClassName =
  "px-3 py-2 transition-colors hover:bg-muted/50 dark:hover:bg-input/30"

function isEmptySets(data: SearchSetsApiResponse) {
  return data.data.sets.length === 0
}

function isEmptyParts(data: SearchPartsApiResponse) {
  return data.data.parts.length === 0
}

const SearchResults = () => {
  const [search] = useQueryState("search", { defaultValue: "" })
  const [mode] = useQueryState("mode", { defaultValue: "sets" })
  const debouncedSearch = useDebouncedValue(search, SEARCH_DEBOUNCE_MS)
  const [selectedSet, setSelectedSet] = useState<SetSummary | null>(null)
  const [selectedPart, setSelectedPart] = useState<PartSummary | null>(null)

  const trimmedSearch = debouncedSearch.trim()
  const immediateTrimmedSearch = search.trim()
  const query = { search: trimmedSearch, limit: RESULTS_LIMIT }
  const canQuery = trimmedSearch.length >= MIN_SEARCH_LENGTH
  const isPartsMode = mode === "parts"

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
                    className="w-full flex flex-col items-start justify-center px-0 py-6 gap-0"
                  >
                    <span className="font-mono text-muted-foreground text-xs">
                      {part.partNum}
                    </span>
                    <span className="block text-sm">{part.name}</span>
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
                  className="w-full flex flex-row items-center justify-start px-0 py-6 gap-4"
                >
                  <SetAvatar themeId={set.themeId} themeName={set.themeName} />
                  <div className="flex flex-col items-start justify-center">
                    <span className="block text-sm">{set.name}</span>
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
