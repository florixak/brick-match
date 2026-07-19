"use client"

import { debounce, useQueryState } from "nuqs"
import { SEARCH_DEBOUNCE_MS } from "@/constants"
import { cn } from "@/lib/utils"
import { Input } from "../ui/input"
import { searchPanelClassName, searchSurfaceClassName } from "./search"
import SearchResults from "./search-results"

const SearchField = () => {
  const [search, setSearch] = useQueryState("search", {
    defaultValue: "",
    shallow: false,
    limitUrlUpdates: debounce(SEARCH_DEBOUNCE_MS),
  })

  return (
    <div className="relative z-20 mx-auto w-full max-w-lg">
      <Input
        type="text"
        role="searchbox"
        placeholder="Search for sets or parts"
        aria-expanded={Boolean(search)}
        aria-controls="search-results"
        className={cn(
          "h-12 w-full px-4 py-2 font-sans text-xl shadow-md",
          searchSurfaceClassName,
        )}
        value={search}
        onChange={(event) => void setSearch(event.target.value)}
      />
      {search ? (
        <div
          id="search-results"
          className={cn("absolute top-full mt-2 w-full", searchPanelClassName)}
        >
          <SearchResults />
        </div>
      ) : null}
    </div>
  )
}

export default SearchField
