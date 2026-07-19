"use client"

import { SearchIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ButtonGroup } from "@/components/ui/button-group"
import { Input } from "@/components/ui/input"
import { searchOptions } from "@/constants"
import { cn } from "@/lib/utils"

const searchSurfaceClassName =
  "!border-border !bg-card dark:!border-input dark:!bg-input/30"

const Search = () => {
  // later will be fetched from the database
  const tips = [
    {
      label: "Ninjago",
      color: "bg-red-600",
    },
    {
      label: "Star Wars",
      color: "bg-black",
    },
    {
      label: "City",
      color: "bg-blue-600",
    },
    {
      label: "Ideas",
      color: "bg-indigo-600",
    },
    {
      label: "Power Miners",
      color: "bg-green-600",
    },
    {
      label: "Bionicle",
      color: "bg-yellow-600",
    },
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

      <div className="flex gap-2 w-full max-w-lg flex-wrap justify-center">
        {tips.map((tip) => (
          <Button
            key={tip.label}
            variant="outline"
            className={cn(
              "justify-start shadow-sm shrink-0",
              searchSurfaceClassName,
            )}
          >
            <div className={`${tip.color} rounded-full size-3`} />
            <span>{tip.label}</span>
          </Button>
        ))}
      </div>
    </section>
  )
}

export default Search
