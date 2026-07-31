"use client"

import { SearchIcon } from "lucide-react"
import { useQueryStates } from "nuqs"
import { catalogSearchParams } from "@/lib/search/search-params"
import { cn } from "@/lib/utils"
import { Input } from "../ui/input"
import { searchPanelClassName, searchSurfaceClassName } from "./search"
import SearchResults from "./search-results"

const SearchField = () => {
  const [queryParams, setQueryParams] = useQueryStates(catalogSearchParams)

  return (
    <div className="relative z-20 mx-auto w-full max-w-lg">
      <SearchIcon
        aria-hidden
        className="pointer-events-none absolute top-1/2 left-4 size-5 -translate-y-1/2 text-muted-foreground"
      />
      <Input
        type="text"
        role="searchbox"
        placeholder={
          queryParams.mode === "sets"
            ? "Search by set name or number…"
            : "Search by part name or number…"
        }
        aria-expanded={Boolean(queryParams.q)}
        aria-controls="search-results"
        className={cn(
          "h-12 w-full py-2 pr-4 pl-12 font-sans text-xl shadow-md",
          searchSurfaceClassName,
        )}
        value={queryParams.q}
        onChange={(event) => {
          void setQueryParams({ q: event.target.value })
        }}
      />
      {queryParams.q ? (
        <div
          id="search-results"
          className={cn(
            searchPanelClassName,
            "absolute top-full z-50 mt-2 w-full max-h-60 md:max-h-86 overflow-x-hidden overflow-y-auto overscroll-y-contain thin-scrollbar",
          )}
        >
          <SearchResults />
        </div>
      ) : null}
    </div>
  )
}

export default SearchField
