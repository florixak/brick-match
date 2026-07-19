"use client"

import type { Theme } from "@lego-matcher/shared-types"
import { cn, getThemeDotClassName } from "@/lib/utils"
import { Button } from "../ui/button"
import { searchSurfaceClassName } from "./search"

const SearchTips = () => {
  // later will be fetched from the database
  const tips: Theme[] = [
    { id: 1, name: "Ninjago", parentId: null },
    { id: 2, name: "Star Wars", parentId: null },
    { id: 3, name: "City", parentId: null },
    { id: 4, name: "Ideas", parentId: null },
    { id: 5, name: "Power Miners", parentId: null },
    { id: 6, name: "Bionicle", parentId: null },
  ]

  return (
    <div className="flex gap-2 w-full max-w-lg flex-wrap justify-center">
      {tips.map((tip) => {
        const color = getThemeDotClassName(tip.id)
        return (
          <Button
            key={tip.name}
            variant="outline"
            className={cn(
              "justify-start shadow-sm shrink-0",
              searchSurfaceClassName,
            )}
          >
            <div className={`${color} rounded-full size-3`} />
            <span>{tip.name}</span>
          </Button>
        )
      })}
    </div>
  )
}

export default SearchTips
