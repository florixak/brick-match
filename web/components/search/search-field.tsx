"use client"

import { SearchIcon } from "lucide-react"
import { debounce, useQueryState } from "nuqs"
import { SEARCH_DEBOUNCE_MS } from "@/constants"
import { cn } from "@/lib/utils"
import { Input } from "../ui/input"
import { searchPanelClassName, searchSurfaceClassName } from "./search"
import SearchResults from "./search-results"

const SearchField = () => {
  const [search, setSearch] = useQueryState("search", {
    defaultValue: "",
    limitUrlUpdates: debounce(SEARCH_DEBOUNCE_MS),
  })
  const [mode] = useQueryState("mode", {
    defaultValue: "sets",
  })

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
          mode === "sets"
            ? "Search by set name or number…"
            : "Search by part name or number…"
        }
        aria-expanded={Boolean(search)}
        aria-controls="search-results"
        className={cn(
          "h-12 w-full py-2 pr-4 pl-12 font-sans text-xl shadow-md",
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
