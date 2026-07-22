import { FieldLabel } from "../ui/field-label"
import { Skeleton } from "../ui/skeleton"

type FilterSelectProps = {
  label: string
}

const FilterSelect = ({ label }: FilterSelectProps) => {
  return (
    <div className="flex flex-col gap-1.5">
      <FieldLabel>{label}</FieldLabel>
      <Skeleton className="h-9 w-full" />
    </div>
  )
}

export default FilterSelect
