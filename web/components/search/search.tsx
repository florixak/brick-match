"use client"

import { SearchIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ButtonGroup } from "@/components/ui/button-group"
import { Input } from "@/components/ui/input"
import { searchOptions } from "@/constants"
import { cn } from "@/lib/utils"
import SearchTips from "./search-tips"

export const searchSurfaceClassName =
  "!border-border !bg-card dark:!border-input dark:!bg-input/30"

const Search = () => {
  // later will be fetched from the database
  const tips = [
    { id: 1, name: "Ninjago", parentId: null },
    { id: 2, name: "Star Wars", parentId: null },
    { id: 3, name: "City", parentId: null },
    { id: 4, name: "Ideas", parentId: null },
    { id: 5, name: "Power Miners", parentId: null },
    { id: 6, name: "Bionicle", parentId: null },
  ]

  return (
    <section className="flex flex-col items-center justify-center px-4 gap-8">
      <ButtonGroup>
        {searchOptions.map((option) => (
          <Button
            key={option.value}
            variant="outline"
            size="lg"
            className={cn("h-10 px-4 shadow-md", searchSurfaceClassName)}
          >
            <option.icon />
            {option.label}
          </Button>
        ))}
      </ButtonGroup>

      <div className="relative w-full max-w-lg">
        <SearchIcon className="pointer-events-none absolute top-1/2 left-3 z-10 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="text"
          role="searchbox"
          placeholder="Search by set name or number..."
          className={cn(
            "h-10 rounded-lg pl-9 shadow-md font-semibold",
            searchSurfaceClassName,
          )}
        />
      </div>

      <SearchTips tips={tips} />
    </section>
  )
}

export default Search
