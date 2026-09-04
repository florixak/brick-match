import type { MatchResult } from "@brick-match/shared-types"
import { ChevronDownIcon } from "lucide-react"
import { ColorSwatch } from "@/lib/owned-parts/color"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "../ui/collapsible"

const MISSING_PARTS_EXPAND_THRESHOLD = 20

type MissingPartsCollapsibleProps = {
  selectedMatch: MatchResult
}

const MissingPartsCollapsible = ({
  selectedMatch,
}: MissingPartsCollapsibleProps) => {
  const missingLineCount = selectedMatch.missingParts.length
  const missingPieceCount = selectedMatch.missingParts.reduce(
    (acc, part) => acc + part.quantity,
    0,
  )

  return (
    <Collapsible
      key={selectedMatch.setNum}
      defaultOpen={missingLineCount <= MISSING_PARTS_EXPAND_THRESHOLD}
    >
      <section className="overflow-hidden rounded-2xl border-2 border-border bg-card shadow-md">
        <CollapsibleTrigger className="group flex w-full items-center justify-between gap-3 p-4 text-left transition-colors hover:bg-accent/20 focus-visible:ring-inset">
          <div>
            <h3 className="font-black text-sm uppercase tracking-wide">
              Missing Parts
            </h3>
            <p className="mt-0.5 text-muted-foreground text-xs">
              {missingLineCount} line{missingLineCount === 1 ? "" : "s"} ·{" "}
              {missingPieceCount} pieces
            </p>
          </div>
          <ChevronDownIcon className="size-4 shrink-0 text-muted-foreground transition-transform group-aria-expanded:rotate-180" />
        </CollapsibleTrigger>

        <CollapsibleContent>
          <ul className="max-h-[min(12rem,30dvh)] divide-y divide-border overflow-y-auto border-t border-border sm:max-h-48">
            {selectedMatch.missingParts.map((part) => (
              <li
                key={`${part.partNum}-${part.colorId}`}
                className="flex items-center gap-3 px-4 py-2.5 text-sm"
              >
                <ColorSwatch
                  rgb={part.colorRgb}
                  isTrans={part.colorIsTrans}
                  className="size-4"
                />
                <span className="min-w-0 flex-1">
                  <span
                    className="block truncate font-semibold leading-tight"
                    title={part.partName}
                  >
                    {part.partName}
                  </span>
                  <span className="block truncate text-muted-foreground text-xs">
                    {part.partNum} · {part.colorName}
                  </span>
                </span>
                <span className="shrink-0 font-black tabular-nums">
                  ×{part.quantity}
                </span>
              </li>
            ))}
          </ul>
        </CollapsibleContent>
      </section>
    </Collapsible>
  )
}

export default MissingPartsCollapsible
