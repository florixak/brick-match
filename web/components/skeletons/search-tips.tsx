import { TIPS_COUNT } from "@/constants"
import { Skeleton } from "../ui/skeleton"

const TIP_SKELETON_KEYS = Array.from(
  { length: TIPS_COUNT },
  (_, index) => `search-tip-skeleton-${index}`,
)

const SearchTipsSkeleton = () => {
  return (
    <div className="flex w-full max-w-lg flex-wrap justify-center gap-2">
      {TIP_SKELETON_KEYS.map((key) => (
        <Skeleton key={key} className="h-10 w-24" />
      ))}
    </div>
  )
}

export default SearchTipsSkeleton
