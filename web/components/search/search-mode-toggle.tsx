"use client"

import { useQueryState } from "nuqs"
import { SEARCH_OPTIONS } from "@/constants"
import { cn } from "@/lib/utils"
import { Button } from "../ui/button"
import { ButtonGroup } from "../ui/button-group"
import { searchSurfaceClassName } from "./search"

const SearchModeToggle = () => {
  const [mode, setMode] = useQueryState("mode", { defaultValue: "sets" })
  return (
    <ButtonGroup>
      {SEARCH_OPTIONS.map((option) => {
        const isActive = mode === option.value
        return (
          <Button
            key={option.value}
            variant={isActive ? "default" : "outline"}
            size="lg"
            className={cn(
              "h-10 px-4 shadow-md disabled:opacity-100",
              !isActive && searchSurfaceClassName,
            )}
            onClick={() => setMode(option.value)}
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
