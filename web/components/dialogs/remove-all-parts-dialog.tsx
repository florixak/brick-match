"use client"

import { useState } from "react"
import toast from "react-hot-toast"
import { parseApiError } from "@/lib/api/client"
import { useRemoveAllOwnedPartsMutation } from "@/lib/queries"
import { cn } from "@/lib/utils"
import { searchSurfaceClassName } from "../search/search"
import { Button } from "../ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog"
import { Input } from "../ui/input"

type RemoveAllPartsDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  totalItems: number
}

const RemoveAllPartsDialog = ({
  open,
  onOpenChange,
  totalItems,
}: RemoveAllPartsDialogProps) => {
  const { mutate, isPending } = useRemoveAllOwnedPartsMutation()
  const [confirmation, setConfirmation] = useState("")
  const confirmationText = `Delete ${totalItems} parts`

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      setConfirmation("")
    }
    onOpenChange(nextOpen)
  }

  const handleConfirm = () => {
    if (confirmation !== confirmationText) {
      toast.error("Invalid confirmation")
      return
    }

    mutate(undefined, {
      onSuccess: () => {
        handleOpenChange(false)
        toast.success("Collection cleared")
      },
      onError: (error) => {
        const apiError = parseApiError(error)
        toast.error(apiError?.body.message ?? "Failed to clear collection.")
      },
    })
  }

  const description = `This will permanently remove all ${totalItems} part${totalItems === 1 ? "" : "s"} from your collection. This cannot be undone.`
  const canConfirm = confirmation === confirmationText

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Clear entire collection?</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <Input
          type="text"
          placeholder={`Type "${confirmationText}" to confirm`}
          value={confirmation}
          onChange={(e) => setConfirmation(e.target.value)}
          className={cn(searchSurfaceClassName)}
        />

        <DialogFooter className="flex-col gap-4 sm:flex-row sm:justify-end">
          <Button
            type="button"
            variant="destructive"
            disabled={isPending || !canConfirm}
            className="h-10 w-full sm:w-auto"
            onClick={handleConfirm}
          >
            Remove all parts
          </Button>
          <Button
            type="button"
            variant="outline"
            disabled={isPending}
            className="h-10 w-full sm:w-auto"
            onClick={() => handleOpenChange(false)}
          >
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default RemoveAllPartsDialog
