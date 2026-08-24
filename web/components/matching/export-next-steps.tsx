"use client"

import { ChevronDownIcon } from "lucide-react"
import Link from "next/link"
import type { Ref } from "react"
import { Button } from "../ui/button"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "../ui/collapsible"

type ExportNextStepsProps = {
  ref?: Ref<HTMLDivElement>
  open: boolean
  onOpenChange: (open: boolean) => void
  justDownloaded: boolean
}

const ExportNextSteps = ({
  ref,
  open,
  onOpenChange,
  justDownloaded,
}: ExportNextStepsProps) => {
  return (
    <div ref={ref}>
      <Collapsible open={open} onOpenChange={onOpenChange}>
        <section className="overflow-hidden rounded-2xl border-2 border-border bg-card shadow-md">
          <CollapsibleTrigger className="group flex w-full items-center justify-between gap-3 p-4 text-left transition-colors hover:bg-accent/20 focus-visible:ring-inset">
            <div>
              <h3 className="font-black text-sm uppercase tracking-wide">
                How to use this file
              </h3>
              <p
                className="mt-0.5 text-muted-foreground text-xs"
                aria-live="polite"
              >
                {justDownloaded
                  ? "CSV downloaded — next steps"
                  : "Import on Rebrickable, then export to BrickLink"}
              </p>
            </div>
            <ChevronDownIcon className="size-4 shrink-0 text-muted-foreground transition-transform group-aria-expanded:rotate-180" />
          </CollapsibleTrigger>

          <CollapsibleContent>
            <div className="space-y-3 border-t border-border p-4">
              <ol className="list-decimal space-y-1.5 pl-4 text-sm text-muted-foreground">
                <li>The CSV is in your downloads</li>
                <li>
                  On Rebrickable, register an account and create a Part List and
                  import it
                </li>
                <li>From that list, export as BrickLink XML</li>
              </ol>
              <Button
                variant="outline"
                nativeButton={false}
                className="h-10 w-full"
                render={
                  <Link
                    href="https://rebrickable.com"
                    target="_blank"
                    rel="noopener noreferrer"
                  />
                }
              >
                Open Rebrickable
              </Button>
            </div>
          </CollapsibleContent>
        </section>
      </Collapsible>
    </div>
  )
}

export default ExportNextSteps
