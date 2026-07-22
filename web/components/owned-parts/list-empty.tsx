import { SearchIcon } from "lucide-react"

type ListEmptyProps = {
  hasFilters: boolean
}

const ListEmpty = ({ hasFilters }: ListEmptyProps) => {
  return (
    <div className="rounded-2xl border-2 border-border bg-card py-16 text-center">
      <SearchIcon
        className="mx-auto mb-3 size-10 text-muted-foreground opacity-30"
        aria-hidden
      />
      <p className="font-black text-muted-foreground">
        {hasFilters
          ? "No parts match your filters"
          : "Your collection is empty"}
      </p>
    </div>
  )
}

export default ListEmpty
