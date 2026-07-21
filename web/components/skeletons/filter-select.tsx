import { labelClassName } from "../owned-parts/filters"
import { Skeleton } from "../ui/skeleton"

type FilterSelectProps = {
  label: string
}

const FilterSelect = ({ label }: FilterSelectProps) => {
  return (
    <div className="flex flex-col gap-1.5">
      <span className={labelClassName}>{label}</span>
      <Skeleton className="h-9 w-full" />
    </div>
  )
}

export default FilterSelect
