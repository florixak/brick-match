import { Button } from "../ui/button"
import { FieldCaption } from "../ui/field-label"

const SelectErrorFallback = (error: Error, retry: () => void) => {
  return (
    <div className="flex flex-col gap-1.5">
      <FieldCaption>Filter unavailable</FieldCaption>
      <div className="flex flex-col gap-2 rounded-lg border border-destructive/30 bg-destructive/5 p-2">
        <p className="text-destructive text-xs">{error.message}</p>
        <Button type="button" variant="outline" size="sm" onClick={retry}>
          Try again
        </Button>
      </div>
    </div>
  )
}

export default SelectErrorFallback
