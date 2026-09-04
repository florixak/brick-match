"use client"

import type { MatchResult } from "@brick-match/shared-types"
import Link from "next/link"
import { useRef, useState } from "react"
import { toast } from "react-hot-toast"
import useIsAuthenticated from "@/hooks/use-is-authenticated"
import { parseApiError } from "@/lib/api/client"
import {
  useBuildSetMutation,
  useExportMissingPartsMutation,
} from "@/lib/queries"
import { cn, formatSetNumber, getThemeTextClassName } from "@/lib/utils"
import ExportNextSteps from "../matching/export-next-steps"
import MissingPartsCollapsible from "../matching/missing-parts-collapsible"
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

type MatchDialogBodyProps = {
  selectedMatch: MatchResult
  setSelectedMatch: (part: MatchResult | null) => void
  isAuthenticated: boolean
}

const MatchDialogBody = ({
  selectedMatch,
  setSelectedMatch,
  isAuthenticated,
}: MatchDialogBodyProps) => {
  const { mutate: exportMissingParts, isPending: isExportingMissingParts } =
    useExportMissingPartsMutation()
  const { mutate: buildSet, isPending: isBuildingSet } = useBuildSetMutation()

  const [justDownloaded, setJustDownloaded] = useState(false)
  const [exportHelpOpen, setExportHelpOpen] = useState(false)
  const exportHelpRef = useRef<HTMLDivElement>(null)

  const missingLineCount = selectedMatch.missingParts.length
  const missingPieceCount = selectedMatch.missingParts.reduce(
    (total, part) => total + part.quantity,
    0,
  )
  const matchPercent = Math.round(selectedMatch.matchPercentage * 100)
  const hasMissingParts = missingLineCount > 0

  const showExportMissingPartsButton = isAuthenticated && hasMissingParts
  const showBuildSetButton = isAuthenticated && !hasMissingParts

  const handleExportMissingParts = () => {
    if (isExportingMissingParts || !hasMissingParts) return
    exportMissingParts(selectedMatch.setNum, {
      onSuccess: () => {
        setJustDownloaded(true)
        setExportHelpOpen(true)
        toast.success("CSV downloaded.")
        requestAnimationFrame(() => {
          exportHelpRef.current?.scrollIntoView({
            behavior: "smooth",
            block: "nearest",
          })
        })
      },
      onError: (error: unknown) => {
        const apiError = parseApiError(error)
        toast.error(apiError?.body.message ?? "Failed to export missing parts.")
      },
    })
  }

  const handleBuildSet = () => {
    if (isBuildingSet || hasMissingParts) return
    buildSet(selectedMatch.setNum, {
      onSuccess: () => {
        toast.success("Set built successfully.")
        setSelectedMatch(null)
      },
      onError: (error: unknown) => {
        const apiError = parseApiError(error)
        toast.error(apiError?.body.message ?? "Failed to build set.")
      },
    })
  }

  return (
    <>
      <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto overscroll-contain p-4">
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

        <p className="text-sm text-muted-foreground">
          {matchPercent}% complete
          {hasMissingParts
            ? ` · Missing ${missingLineCount} part${missingLineCount === 1 ? "" : "s"} (${missingPieceCount} piece${missingPieceCount === 1 ? "" : "s"})`
            : " · You have all required parts"}
        </p>

        {hasMissingParts ? (
          <MissingPartsCollapsible selectedMatch={selectedMatch} />
        ) : null}

        {showExportMissingPartsButton ? (
          <ExportNextSteps
            ref={exportHelpRef}
            open={exportHelpOpen}
            onOpenChange={setExportHelpOpen}
            justDownloaded={justDownloaded}
          />
        ) : null}
      </div>

      <DialogFooter className="mx-0 mb-0 shrink-0 flex-col gap-3 sm:flex-row sm:justify-stretch">
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
        {showExportMissingPartsButton ? (
          <Button
            disabled={isExportingMissingParts}
            className="h-10 w-full sm:flex-1 sm:basis-0"
            onClick={handleExportMissingParts}
          >
            {isExportingMissingParts
              ? "Downloading..."
              : "Download Rebrickable CSV"}
          </Button>
        ) : null}
        {showBuildSetButton ? (
          <Button
            disabled={isBuildingSet}
            className="h-10 w-full sm:flex-1 sm:basis-0"
            onClick={handleBuildSet}
          >
            {isBuildingSet ? "Building..." : "Build Set"}
          </Button>
        ) : null}
      </DialogFooter>
    </>
  )
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
      <DialogContent className="flex max-h-[calc(100dvh-2rem)] flex-col gap-0 overflow-hidden p-0 sm:max-w-md top-4 translate-y-0 sm:top-1/2 sm:-translate-y-1/2">
        {selectedMatch ? (
          <MatchDialogBody
            key={selectedMatch.setNum}
            selectedMatch={selectedMatch}
            setSelectedMatch={setSelectedMatch}
            isAuthenticated={isAuthenticated}
          />
        ) : null}
      </DialogContent>
    </Dialog>
  )
}

export default MatchDialog
