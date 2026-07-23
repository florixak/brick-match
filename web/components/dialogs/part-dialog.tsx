import type { PartSummary } from "@lego-matcher/shared-types"
import { Loader2 } from "lucide-react"
import { useState } from "react"
import toast from "react-hot-toast"
import useIsAuthenticated from "@/hooks/use-is-authenticated"
import { parseApiError } from "@/lib/api/client"
import { toColorOptions } from "@/lib/owned-parts/color"
import { useAddOwnedPartMutation, useCatalogColors } from "@/lib/queries"
import SelectErrorFallback from "../fallbacks/select-error"
import { AsyncQueryState } from "../query/async-query-state"
import { searchSurfaceClassName } from "../search/search"
import FilterSelect from "../skeletons/filter-select"
import { Button } from "../ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog"
import QuantityInput from "../ui/quantity-input"
import SearchableSelect from "../ui/searchable-select"

type PartDialogProps = {
  selectedPart: PartSummary | null
  setSelectedPart: (part: PartSummary | null) => void
}

const PartDialog = ({ selectedPart, setSelectedPart }: PartDialogProps) => {
  const [colorId, setColorId] = useState<number | null>(null)
  const [quantity, setQuantity] = useState(1)
  const colors = useCatalogColors()
  const isAuthenticated = useIsAuthenticated()
  const { mutate: addPart, isPending } = useAddOwnedPartMutation()

  const handleAddPart = () => {
    if (selectedPart && colorId !== null) {
      addPart(
        { partNum: selectedPart.partNum, colorId, quantity },
        {
          onSuccess: () => {
            toast.success(`Added ×${quantity} ${selectedPart.name}`)
            setSelectedPart(null)
          },
          onError: (error) => {
            const apiError = parseApiError(error)
            toast.error(apiError?.body.message ?? "Failed to add part.")
          },
        },
      )
    }
  }

  return (
    <Dialog
      open={selectedPart !== null}
      onOpenChange={(open) => {
        if (!open) {
          setSelectedPart(null)
          setColorId(null)
          setQuantity(1)
        }
      }}
    >
      <DialogContent>
        {selectedPart ? (
          <>
            <DialogHeader>
              <DialogTitle>{selectedPart.name}</DialogTitle>
              <DialogDescription>{selectedPart.partNum}</DialogDescription>
            </DialogHeader>
            <AsyncQueryState
              isLoading={colors.isPending}
              isFetching={colors.isFetching}
              isError={colors.isError}
              isSuccess={colors.isSuccess}
              isStale={colors.isStale}
              error={colors.error}
              data={colors.data}
              onRetry={() => void colors.refetch()}
              skeleton={<FilterSelect label="Color" />}
              errorFallback={SelectErrorFallback}
            >
              {(data) => (
                <SearchableSelect
                  id="owned-parts-color"
                  label="Color"
                  placeholder="All colors"
                  emptyMessage="No colors found."
                  value={colorId}
                  onValueChange={(colorId) => {
                    setColorId(colorId)
                  }}
                  options={toColorOptions(data)}
                  triggerClassName={searchSurfaceClassName}
                />
              )}
            </AsyncQueryState>
            <QuantityInput
              id="part-dialog-quantity"
              value={quantity}
              onValueChange={setQuantity}
              disabled={isPending}
            />
            <DialogFooter className="flex-col gap-3 sm:flex-row sm:justify-stretch">
              <Button
                onClick={handleAddPart}
                disabled={!isAuthenticated || isPending || colorId === null}
                className="h-10 w-full sm:flex-1 sm:basis-0"
              >
                {isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Add Part to Collection"
                )}
              </Button>
            </DialogFooter>
          </>
        ) : null}
      </DialogContent>
    </Dialog>
  )
}

export default PartDialog
