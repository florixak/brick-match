import { Skeleton } from "@/components/ui/skeleton"

const CARD_KEYS = ["a", "b", "c", "d", "e", "f", "g", "h"] as const

const OwnedPartsListSkeleton = () => {
  return (
    <div
      className="grid gap-3"
      style={{ gridTemplateColumns: "repeat(auto-fill, minmax(130px, 1fr))" }}
    >
      {CARD_KEYS.map((key) => (
        <div
          key={key}
          className="overflow-hidden rounded-2xl border-2 border-border bg-card"
        >
          <Skeleton className="h-16 rounded-none" />
          <div className="space-y-2 p-2.5">
            <Skeleton className="h-3 w-4/5" />
            <Skeleton className="h-3 w-3/5" />
            <Skeleton className="h-4 w-1/3" />
          </div>
        </div>
      ))}
    </div>
  )
}

export default OwnedPartsListSkeleton
