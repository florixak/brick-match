import { EllipsisIcon, Trash2Icon, XIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

type ActiveFilter = {
  label: string
  onClear: () => void
}

type ListHeaderProps = {
  totalItems: number
  activeFilters: ActiveFilter[]
  onClearCollection: () => void
}

const ListHeader = ({
  totalItems,
  activeFilters,
  onClearCollection,
}: ListHeaderProps) => {
  return (
    <div className="mb-4 flex flex-wrap items-center justify-between gap-3 font-semibold text-muted-foreground text-sm">
      <div className="flex flex-wrap items-center gap-3">
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

      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="font-semibold"
            />
          }
        >
          <EllipsisIcon className="size-4" aria-hidden />
          Collection
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem
            variant="destructive"
            onClick={onClearCollection}
            className="cursor-pointer"
          >
            <Trash2Icon />
            Clear entire collection…
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}

export default ListHeader
