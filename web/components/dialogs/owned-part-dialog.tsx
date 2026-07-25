import type {
  GetOwnedPartsQuery,
  OwnedPartDetail,
} from "@lego-matcher/shared-types"
import { Loader2 } from "lucide-react"
import { useEffect, useState } from "react"
import toast from "react-hot-toast"
import useIsAuthenticated from "@/hooks/use-is-authenticated"
import { parseApiError } from "@/lib/api/client"
import { toColorOptions } from "@/lib/owned-parts/color"
import {
  useAddOwnedPartMutation,
  useCatalogColors,
  useRemoveOwnedPartMutation,
  useUpdateOwnedPartMutation,
} from "@/lib/queries"
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

type OwnedPartDialogProps = {
  selectedPart: OwnedPartDetail | null
  setSelectedPart: () => void
  listQuery: GetOwnedPartsQuery
}

const OwnedPartDialog = ({
  selectedPart,
  setSelectedPart,
  listQuery,
}: OwnedPartDialogProps) => {
  const [colorId, setColorId] = useState<number | null>(
    selectedPart?.colorId ?? null,
  )
  const [quantity, setQuantity] = useState(selectedPart?.quantity ?? 1)
  const colors = useCatalogColors()
  const isAuthenticated = useIsAuthenticated()
  const { mutate: addPart, isPending } = useAddOwnedPartMutation()
  const { mutate: removePart, isPending: isRemovingPart } =
    useRemoveOwnedPartMutation()
  const { mutate: updatePart, isPending: isUpdating } =
    useUpdateOwnedPartMutation()

  useEffect(() => {
    setColorId(selectedPart?.colorId ?? null)
    setQuantity(selectedPart?.quantity ?? 1)
  }, [selectedPart])

  const isDirty =
    selectedPart !== null &&
    colorId !== null &&
    (colorId !== selectedPart.colorId || quantity !== selectedPart.quantity)

  const handleUpdatePart = () => {
    if (!selectedPart || colorId === null) return
    updatePart(
      {
        from: {
          partNum: selectedPart.partNum,
          colorId: selectedPart.colorId,
        },
        to: {
          partNum: selectedPart.partNum,
          colorId,
          quantity,
        },
      },
      {
        onSuccess: (response) => {
          const { part, merged } = response.data
          if (merged) {
            toast.success(
              `Merged into existing part, now ×${part.quantity} total.`,
            )
          } else if (colorId !== selectedPart.colorId) {
            const color = colors.data?.data.colors.find(
              (color) => color.colorId === colorId,
            )
            if (color) {
              toast.success(`Color updated to ${color.name}.`)
            }
          } else {
            toast.success(`Updated to ×${quantity} ${selectedPart.partName}.`)
          }
          setSelectedPart()
        },
        onError: (error) => {
          const apiError = parseApiError(error)
          toast.error(apiError?.body.message ?? "Failed to update part.")
        },
      },
    )
  }

  const handleRemovePart = () => {
    if (selectedPart) {
      removePart(
        {
          partNum: selectedPart.partNum,
          colorId: selectedPart.colorId,
          listQuery,
        },
        {
          onSuccess: () => {
            toast.success(`Removed ${selectedPart.partName}`)
            setSelectedPart()
          },
          onError: (error) => {
            const apiError = parseApiError(error)
            toast.error(apiError?.body.message ?? "Failed to remove part.")
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
          setSelectedPart()
          setColorId(null)
          setQuantity(1)
        }
      }}
    >
      <DialogContent>
        {selectedPart ? (
          <>
            <DialogHeader>
              <DialogTitle>{selectedPart.partName}</DialogTitle>
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
                variant="destructive"
                onClick={handleRemovePart}
                disabled={!isAuthenticated || isRemovingPart || isPending}
                className="h-10 w-full sm:flex-1 sm:basis-0"
              >
                {isRemovingPart ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Remove Part"
                )}
              </Button>
              <Button
                onClick={handleUpdatePart}
                disabled={
                  !isAuthenticated ||
                  isUpdating ||
                  isRemovingPart ||
                  colorId === null ||
                  !isDirty
                }
                className="h-10 w-full sm:flex-1 sm:basis-0"
              >
                {isUpdating ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Update Part"
                )}
              </Button>
            </DialogFooter>
          </>
        ) : null}
      </DialogContent>
    </Dialog>
  )
}

export default OwnedPartDialog
