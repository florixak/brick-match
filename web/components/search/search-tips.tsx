"use client"

import type { Theme, ThemesApiResponse } from "@lego-matcher/shared-types"
import { useQueryState } from "nuqs"
import { useMemo } from "react"
import { AsyncQueryState } from "@/components/query/async-query-state"
import { Button } from "@/components/ui/button"
import { FALLBACK_TIPS, TIPS_COUNT } from "@/constants"
import { useCatalogThemes } from "@/lib/queries"
import { cn, getThemeDotClassName } from "@/lib/utils"
import SearchTipsSkeleton from "../skeletons/search-tips"
import { searchSurfaceClassName } from "./search"

const pickRandomTips = (themes: Theme[], count: number): Theme[] => {
  return [...themes].sort(() => Math.random() - 0.5).slice(0, count)
}

const isEmptyThemes = (data: ThemesApiResponse) => {
  return data.data.themes.length === 0
}

const SearchTipsList = ({ tips }: { tips: Theme[] }) => {
  const [_, setSearch] = useQueryState("search")

  const handleClick = (theme: Theme) => {
    setSearch(theme.name)
  }

  return (
    <div className="flex w-full max-w-lg flex-wrap justify-center gap-2">
      {tips.map((tip) => (
        <Button
          key={tip.id}
          variant="outline"
          className={cn(
            "shrink-0 justify-start shadow-sm",
            searchSurfaceClassName,
          )}
          onClick={() => handleClick(tip)}
        >
          <div
            className={cn(getThemeDotClassName(tip.id), "size-3 rounded-full")}
          />
          <span>{tip.name}</span>
        </Button>
      ))}
    </div>
  )
}

const RandomThemeTips = ({ themes }: { themes: Theme[] }) => {
  const tips = useMemo(() => pickRandomTips(themes, TIPS_COUNT), [themes])

  return <SearchTipsList tips={tips} />
}

const SearchTips = () => {
  const query = useCatalogThemes()

  return (
    <AsyncQueryState
      isLoading={query.isPending}
      isFetching={query.isFetching}
      isError={query.isError}
      isSuccess={query.isSuccess}
      isStale={query.isStale}
      error={query.error}
      data={query.data}
      isEmpty={isEmptyThemes}
      onRetry={() => void query.refetch()}
      skeleton={<SearchTipsSkeleton />}
      empty={<SearchTipsList tips={FALLBACK_TIPS} />}
      errorFallback={() => <SearchTipsList tips={FALLBACK_TIPS} />}
    >
      {(data) => <RandomThemeTips themes={data.data.themes} />}
    </AsyncQueryState>
  )
}

export default SearchTips
