import type { PartSummary } from "@lego-matcher/shared-types"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog"

type PartDialogProps = {
  selectedPart: PartSummary | null
  setSelectedPart: (part: PartSummary | null) => void
}

const PartDialog = ({ selectedPart, setSelectedPart }: PartDialogProps) => {
  return (
    <Dialog
      open={selectedPart !== null}
      onOpenChange={(open) => {
        if (!open) setSelectedPart(null)
      }}
    >
      <DialogContent>
        {selectedPart ? (
          <>
            <DialogHeader>
              <DialogTitle>{selectedPart.name}</DialogTitle>
              <DialogDescription>{selectedPart.partNum}</DialogDescription>
            </DialogHeader>
            {/* detail content */}
          </>
        ) : null}
      </DialogContent>
    </Dialog>
  )
}

export default PartDialog
