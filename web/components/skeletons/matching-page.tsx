import FilterSelect from "@/components/skeletons/filter-select"
import { Skeleton } from "@/components/ui/skeleton"

const pageShellClassName = "mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 md:py-8"

function MatchingPageSkeleton() {
  return (
    <div className={pageShellClassName}>
      <section>
        <Skeleton className="h-9 w-48" />
        <Skeleton className="mt-2 mb-6 h-5 w-full max-w-md" />
      </section>

      <div className="mb-6 flex flex-col gap-4">
        <div className="grid gap-8 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-2">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-4 w-8" />
            </div>
            <Skeleton className="h-4 w-full" />
            <div className="grid grid-cols-3 gap-2">
              <Skeleton className="h-3 w-6" />
              <Skeleton className="mx-auto h-3 w-8" />
              <Skeleton className="ml-auto h-3 w-10" />
            </div>
          </div>
          <FilterSelect label="Theme" />
        </div>
      </div>

      <section className="space-y-4">
        <div className="flex flex-wrap items-center gap-3">
          <Skeleton className="h-10 min-w-0 flex-1" />
          <Skeleton className="h-10 w-28" />
        </div>
        <Skeleton className="h-4 w-full max-w-sm" />
      </section>
    </div>
  )
}

export default MatchingPageSkeleton
