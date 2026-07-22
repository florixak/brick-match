import { XIcon } from "lucide-react"
import { Button } from "@/components/ui/button"

type ActiveFilter = {
  label: string
  onClear: () => void
}

type ListHeaderProps = {
  totalItems: number
  activeFilters: ActiveFilter[]
}

const ListHeader = ({ totalItems, activeFilters }: ListHeaderProps) => {
  return (
    <div className="mb-4 flex flex-wrap items-center gap-3 font-semibold text-muted-foreground text-sm">
      <span>
        {totalItems} part{totalItems === 1 ? "" : "s"}
      </span>
      {activeFilters.map((filter) => (
        <Button
          key={filter.label}
          type="button"
          variant="outline"
          size="sm"
          className="h-auto rounded-full border-primary/20 bg-primary/10 px-2.5 py-1 font-black text-primary text-xs hover:bg-primary/20"
          onClick={filter.onClear}
        >
          {filter.label}
          <XIcon className="size-3" aria-hidden />
        </Button>
      ))}
    </div>
  )
}

export default ListHeader
