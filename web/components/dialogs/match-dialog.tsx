import type { MatchResult } from "@lego-matcher/shared-types"
import Link from "next/link"
import useIsAuthenticated from "@/hooks/use-is-authenticated"
import { cn, formatSetNumber, getThemeTextClassName } from "@/lib/utils"
import SetImage from "../search/set-image"
import { Button } from "../ui/button"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog"

type MatchDialogProps = {
  selectedMatch: MatchResult | null
  setSelectedMatch: (part: MatchResult | null) => void
}

const MatchDialog = ({ selectedMatch, setSelectedMatch }: MatchDialogProps) => {
  const isAuthenticated = useIsAuthenticated()

  return (
    <Dialog
      open={selectedMatch !== null}
      onOpenChange={(open) => {
        if (!open) setSelectedMatch(null)
      }}
    >
      <DialogContent>
        {selectedMatch ? (
          <>
            <SetImage
              setNum={selectedMatch.setNum}
              alt={selectedMatch.setName}
              themeName={selectedMatch.themeName}
              variant="hero"
            />

            <DialogHeader className="gap-1 text-left">
              <DialogTitle className="text-2xl leading-tight">
                {selectedMatch.setName}
              </DialogTitle>
              <p className="text-muted-foreground text-base">
                Set {formatSetNumber(selectedMatch.setNum)}
              </p>
              <p
                className={cn(
                  "font-semibold text-base uppercase tracking-wide",
                  getThemeTextClassName(0),
                )}
              >
                {selectedMatch.themeName}
              </p>
            </DialogHeader>

            <dl className="grid grid-cols-2 gap-4 rounded-lg border bg-muted/40 p-4">
              <div className="space-y-1">
                <dt className="font-medium text-muted-foreground text-xs uppercase tracking-wide">
                  Year
                </dt>
                <dd className="font-semibold text-xl">{selectedMatch.year}</dd>
              </div>
              <div className="space-y-1">
                <dt className="font-medium text-muted-foreground text-xs uppercase tracking-wide">
                  Parts
                </dt>
                <dd className="font-semibold text-xl">
                  {selectedMatch.totalParts}
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
                    href={`https://www.lego.com/en-us/service/building-instructions/${encodeURIComponent(formatSetNumber(selectedMatch.setNum, false))}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    View on LEGO.com
                  </Link>
                }
              />
              <Button
                disabled={!isAuthenticated || true}
                className="h-10 w-full sm:flex-1 sm:basis-0"
              >
                Coming soon...
              </Button>
            </DialogFooter>
          </>
        ) : null}
      </DialogContent>
    </Dialog>
  )
}

export default MatchDialog
