import { SearchIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { Input } from "../ui/input"
import { searchSurfaceClassName } from "./search"

const SearchField = () => {
  return (
    <div className="relative w-full max-w-lg">
      <SearchIcon className="pointer-events-none absolute top-1/2 left-3 z-10 size-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        type="text"
        role="searchbox"
        placeholder="Search by set name or number..."
        className={cn(
          "h-10 rounded-lg pl-9 shadow-md font-semibold",
          searchSurfaceClassName,
        )}
      />
    </div>
  )
}

export default SearchField
