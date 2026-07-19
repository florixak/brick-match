"use client"

import SearchField from "./search-field"
import SearchModeToggle from "./search-mode-toggle"
import SearchTips from "./search-tips"

export const searchSurfaceClassName =
  "!border-border !bg-card dark:!border-input dark:!bg-input/30"

const Search = () => {
  return (
    <section className="flex flex-col items-center justify-center px-4 gap-8">
      <SearchModeToggle />
      <SearchField />
      <SearchTips />
    </section>
  )
}

export default Search
