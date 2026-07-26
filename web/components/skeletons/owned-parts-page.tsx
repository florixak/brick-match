import FilterSelect from "@/components/skeletons/filter-select"
import OwnedPartsListSkeleton from "@/components/skeletons/owned-parts-list"
import { Skeleton } from "@/components/ui/skeleton"

const pageShellClassName = "mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 md:py-8"

function OwnedPartsPageSkeleton() {
  return (
    <div className={pageShellClassName}>
      <section>
        <Skeleton className="h-9 w-52" />
        <Skeleton className="mt-2 mb-6 h-5 w-full max-w-lg" />
      </section>

      <div className="mb-6 flex flex-col gap-4">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <FilterSelect label="Search" />
          <FilterSelect label="Color" />
          <FilterSelect label="Category" />
        </div>
        <div className="flex flex-wrap items-end gap-3">
          <Skeleton className="h-16 w-24" />
          <Skeleton className="h-10 w-28" />
        </div>
      </div>

      <OwnedPartsListSkeleton />
    </div>
  )
}

export default OwnedPartsPageSkeleton
