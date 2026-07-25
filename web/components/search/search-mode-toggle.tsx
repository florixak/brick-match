"use client"

import { useQueryStates } from "nuqs"
import { SEARCH_OPTIONS } from "@/constants"
import { catalogSearchParams } from "@/lib/search/search-params"
import { cn } from "@/lib/utils"
import { Button } from "../ui/button"
import { ButtonGroup } from "../ui/button-group"
import { searchSurfaceClassName } from "./search"

const SearchModeToggle = () => {
  const [queryParams, setQueryParams] = useQueryStates(catalogSearchParams)

  return (
    <ButtonGroup>
      {SEARCH_OPTIONS.map((option) => {
        const isActive = queryParams.mode === option.value
        return (
          <Button
            key={option.value}
            variant={isActive ? "default" : "outline"}
            size="lg"
            className={cn(
              "h-10 px-4 shadow-md disabled:opacity-100",
              !isActive && searchSurfaceClassName,
            )}
            onClick={() => {
              void setQueryParams({ mode: option.value })
            }}
            disabled={isActive}
          >
            <option.icon />
            {option.label}
          </Button>
        )
      })}
    </ButtonGroup>
  )
}

export default SearchModeToggle
