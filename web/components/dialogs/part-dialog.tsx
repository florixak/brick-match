import type { PartSummary } from "@brick-match/shared-types"
import { Loader2 } from "lucide-react"
import { useEffect, useRef, useState } from "react"
import toast from "react-hot-toast"
import useIsAuthenticated from "@/hooks/use-is-authenticated"
import { parseApiError } from "@/lib/api/client"
import { toColorOptions } from "@/lib/owned-parts/color"
import { useAddOwnedPartMutation, usePartColorSelect } from "@/lib/queries"
import SelectErrorFallback from "../fallbacks/select-error"
import { AsyncQueryState } from "../query/async-query-state"
import PartImage from "../search/part-image"
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
  onPendingChange?: (pending: boolean) => void
}

const PartDialog = ({
  selectedPart,
  setSelectedPart,
  onPendingChange,
}: PartDialogProps) => {
  const [colorId, setColorId] = useState<number | null>(null)
  const [quantity, setQuantity] = useState(1)
  const selectedPartRef = useRef(selectedPart)
  selectedPartRef.current = selectedPart
  const colors = usePartColorSelect(selectedPart?.partNum ?? null)
  const isAuthenticated = useIsAuthenticated()
  const { mutate: addPart, isPending } = useAddOwnedPartMutation()

  useEffect(() => {
    onPendingChange?.(isPending)
  }, [isPending, onPendingChange])

  const handleAddPart = () => {
    if (!selectedPart || colorId === null || !colors.data) return

    const selectedColorName = toColorOptions(colors.data).find(
      (option) => option.value === colorId,
    )?.label
    if (!selectedColorName) return

    const addedQuantity = quantity
    const partName = selectedPart.name
    const submittedPartNum = selectedPart.partNum

    addPart(
      { partNum: submittedPartNum, colorId, quantity },
      {
        onSuccess: () => {
          toast.success(
            `Added ×${addedQuantity} ${selectedColorName} ${partName}`,
          )
          if (selectedPartRef.current?.partNum === submittedPartNum) {
            setColorId(null)
            setQuantity(1)
          }
        },
        onError: (error) => {
          const apiError = parseApiError(error)
          toast.error(apiError?.body.message ?? "Failed to add part.")
        },
      },
    )
  }

  useEffect(() => {
    if (!selectedPart) return
    setColorId(null)
    setQuantity(1)
  }, [selectedPart])

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
            <PartImage
              partNum={selectedPart.partNum}
              colorId={colorId ?? undefined}
              alt={selectedPart.name}
              variant="hero"
            />
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
                  placeholder="Select color"
                  emptyMessage="No colors found."
                  value={colorId}
                  onValueChange={(colorId) => {
                    setColorId(colorId)
                  }}
                  options={toColorOptions(data)}
                  triggerClassName={searchSurfaceClassName}
                  disabled={isPending}
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
