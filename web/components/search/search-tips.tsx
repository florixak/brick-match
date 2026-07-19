import type { Theme } from "@lego-matcher/shared-types"
import { cn, getThemeDotClassName } from "@/lib/utils"
import { Button } from "../ui/button"
import { searchSurfaceClassName } from "./search"

type SearchTipsProps = {
  tips: Theme[]
}

const SearchTips = ({ tips }: SearchTipsProps) => {
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
