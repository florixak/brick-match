import { Skeleton } from "@/components/ui/skeleton"

const CARD_KEYS = ["a", "b", "c", "d", "e", "f"] as const

const MatchingResultsSkeleton = () => {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
      {CARD_KEYS.map((key) => (
        <div
          key={key}
          className="overflow-hidden rounded-2xl border-2 border-border bg-card shadow-md"
        >
          <div className="flex flex-col gap-3 p-4">
            <Skeleton className="h-3 w-1/4" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-10 w-1/3" />
            <Skeleton className="h-3 w-2/5" />
          </div>
        </div>
      ))}
    </div>
  )
}

export default MatchingResultsSkeleton
