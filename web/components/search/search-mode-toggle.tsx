import { searchOptions } from "@/constants"
import { cn } from "@/lib/utils"
import { Button } from "../ui/button"
import { ButtonGroup } from "../ui/button-group"
import { searchSurfaceClassName } from "./search"

const SearchModeToggle = () => {
  return (
    <ButtonGroup>
      {searchOptions.map((option) => (
        <Button
          key={option.value}
          variant="outline"
          size="lg"
          className={cn("h-10 px-4 shadow-md", searchSurfaceClassName)}
        >
          <option.icon />
          {option.label}
        </Button>
      ))}
    </ButtonGroup>
  )
}

export default SearchModeToggle
