import type { SetSummary } from "@lego-matcher/shared-types"
import { Loader2 } from "lucide-react"
import Link from "next/link"
import useIsAuthenticated from "@/hooks/use-is-authenticated"
import { useAddSetMutation } from "@/lib/queries"
import { cn, formatSetNumber, getThemeTextClassName } from "@/lib/utils"
import SetAvatar from "../search/set-avatar"
import { Button } from "../ui/button"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog"

type SetDialogProps = {
  selectedSet: SetSummary | null
  setSelectedSet: (set: SetSummary | null) => void
}

const SetDialog = ({ selectedSet, setSelectedSet }: SetDialogProps) => {
  const { mutate: addSet, isPending } = useAddSetMutation()
  const isAuthenticated = useIsAuthenticated()

  const handleAddSet = () => {
    if (selectedSet) {
      addSet(
        { setNum: selectedSet.setNum },
        {
          onSuccess: () => {
            setSelectedSet(null)
          },
          onError: (error) => {
            console.error(error)
          },
        },
      )
    }
  }

  return (
    <Dialog
      open={selectedSet !== null}
      onOpenChange={(open) => {
        if (!open) setSelectedSet(null)
      }}
    >
      <DialogContent>
        {selectedSet ? (
          <>
            <DialogHeader className="flex flex-row items-center gap-4">
              <SetAvatar
                themeId={selectedSet.themeId}
                themeName={selectedSet.themeName}
                setNum={selectedSet.setNum}
                size="lg"
              />
              <div className="flex min-w-0 flex-1 flex-col">
                <DialogTitle className="text-2xl leading-tight">
                  {selectedSet.name}
                </DialogTitle>
                <p className="text-muted-foreground text-base">
                  Set {formatSetNumber(selectedSet.setNum)}
                </p>
                <p
                  className={cn(
                    "font-semibold text-base uppercase tracking-wide",
                    getThemeTextClassName(selectedSet.themeId),
                  )}
                >
                  {selectedSet.themeName}
                </p>
              </div>
            </DialogHeader>

            <dl className="grid grid-cols-2 gap-4 rounded-lg border bg-muted/40 p-4">
              <div className="space-y-1">
                <dt className="font-medium text-muted-foreground text-xs uppercase tracking-wide">
                  Year
                </dt>
                <dd className="font-semibold text-xl">{selectedSet.year}</dd>
              </div>
              <div className="space-y-1">
                <dt className="font-medium text-muted-foreground text-xs uppercase tracking-wide">
                  Parts
                </dt>
                <dd className="font-semibold text-xl">
                  {selectedSet.numParts}
                </dd>
              </div>
            </dl>

            <DialogFooter className="flex-col gap-3 sm:flex-row sm:justify-stretch">
              <Button
                variant="outline"
                nativeButton={false}
                className="h-10 w-full sm:flex-1 sm:basis-0"
                render={
                  <Link
                    href={`https://www.lego.com/en-us/service/building-instructions/${encodeURIComponent(formatSetNumber(selectedSet.setNum, false))}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    View on LEGO.com
                  </Link>
                }
              />
              <Button
                onClick={handleAddSet}
                disabled={!isAuthenticated || isPending}
                className="h-10 w-full sm:flex-1 sm:basis-0"
              >
                {isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Add Parts to Collection"
                )}
              </Button>
            </DialogFooter>
          </>
        ) : null}
      </DialogContent>
    </Dialog>
  )
}

export default SetDialog
