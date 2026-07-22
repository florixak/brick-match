"use client"

import { useQueryStates } from "nuqs"
import { Button } from "@/components/ui/button"
import { ownedPartsSearchParams } from "@/lib/owned-parts/search-params"
import { getVisiblePageNumbers } from "@/lib/pagination/pagination"
import { cn } from "@/lib/utils"

type PaginationProps = {
  page: number
  totalPages: number
  ariaLabel?: string
}

const Pagination = ({
  page,
  totalPages,
  ariaLabel = "Pagination",
}: PaginationProps) => {
  const [, setQueryParams] = useQueryStates(ownedPartsSearchParams)

  if (totalPages <= 1) {
    return null
  }

  const visiblePages = getVisiblePageNumbers(page, totalPages)

  return (
    <nav
      aria-label={ariaLabel}
      className="mt-8 flex items-center justify-center gap-2"
    >
      <Button
        aria-label="Go to previous page"
        type="button"
        variant="outline"
        size="sm"
        className="rounded-xl border-2 font-black"
        disabled={page <= 1}
        onClick={() => {
          void setQueryParams({ page: Math.max(1, page - 1) })
        }}
      >
        ←
      </Button>
      {visiblePages.map((value, index) => {
        if (value === "ellipsis") {
          const previousPage = visiblePages[index - 1]
          const nextPage = visiblePages[index + 1]
          return (
            <span
              key={`ellipsis-${previousPage}-${nextPage}`}
              className="px-2 font-black text-muted-foreground"
            >
              …
            </span>
          )
        }
        return (
          <Button
            key={value}
            aria-current={page === value ? "page" : undefined}
            type="button"
            variant={page === value ? "default" : "outline"}
            size="icon-sm"
            className={cn(
              "rounded-xl border-2 font-black",
              page !== value && "bg-card hover:border-primary",
            )}
            onClick={() => {
              void setQueryParams({ page: value })
            }}
          >
            {value}
          </Button>
        )
      })}
      <Button
        aria-label="Go to next page"
        type="button"
        variant="outline"
        size="sm"
        className="rounded-xl border-2 font-black"
        disabled={page >= totalPages}
        onClick={() => {
          void setQueryParams({ page: Math.min(totalPages, page + 1) })
        }}
      >
        →
      </Button>
    </nav>
  )
}

export default Pagination
