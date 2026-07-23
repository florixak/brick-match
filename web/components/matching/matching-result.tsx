import type { MatchResult } from "@lego-matcher/shared-types"
import Image from "next/image"
import { useState } from "react"
import { cn, getSetImageUrlCandidates } from "@/lib/utils"

type Props = {
  result: MatchResult
}

function matchColor(fraction: number): string {
  if (fraction >= 0.8) return "text-green-500"
  if (fraction >= 0.5) return "text-yellow-500"
  return "text-red-500"
}

function progressColor(fraction: number): string {
  if (fraction >= 0.8) return "bg-green-500"
  if (fraction >= 0.5) return "bg-yellow-500"
  return "bg-red-500"
}

const MatchingResult = ({ result }: Props) => {
  const percent = Math.round(result.matchPercentage * 100)
  const imageCandidates = getSetImageUrlCandidates(result.setNum)
  const [imageIndex, setImageIndex] = useState(0)
  const imgUrl = imageCandidates[imageIndex]!

  return (
    <article className="flex gap-3 overflow-hidden rounded-2xl border-2 border-border bg-card p-4 shadow-md">
      <div className="relative size-16 shrink-0 overflow-hidden rounded-lg bg-muted">
        <Image
          src={imgUrl}
          alt={result.setName}
          fill
          sizes="64px"
          className="object-contain p-1"
          unoptimized
          onError={() =>
            setImageIndex((index) =>
              index < imageCandidates.length - 1 ? index + 1 : index,
            )
          }
        />
      </div>

      <div className="min-w-0 flex-1 flex flex-col gap-1.5">
        <p className="truncate font-black leading-tight">{result.setName}</p>

        <p className="text-xs text-muted-foreground">
          <span className="font-mono">#{result.setNum}</span>
          {" · "}
          {result.themeName}
          {" · "}
          {result.year}
        </p>

        <div className="flex items-center gap-2">
          <div className="relative h-2 flex-1 overflow-hidden rounded-full bg-muted">
            <div
              className={cn(
                "h-full rounded-full transition-all",
                progressColor(result.matchPercentage),
              )}
              style={{ width: `${percent}%` }}
            />
          </div>
          <span
            className={cn(
              "text-sm font-black tabular-nums",
              matchColor(result.matchPercentage),
            )}
          >
            {percent}%
          </span>
        </div>

        <p className="text-xs text-muted-foreground">
          {result.ownedParts} / {result.totalParts} parts
        </p>
      </div>
    </article>
  )
}

export default MatchingResult
