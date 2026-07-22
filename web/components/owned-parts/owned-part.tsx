import type { OwnedPartDetail } from "@lego-matcher/shared-types"
import { isLightColor, toCssHex } from "@/lib/owned-parts/color"
import { cn } from "@/lib/utils"

type OwnedPartProps = {
  part: OwnedPartDetail
  className?: string
}

const OwnedPart = ({ part, className }: OwnedPartProps) => {
  const colorHex = toCssHex(part.colorRgb)
  const lightBackground = isLightColor(colorHex)

  return (
    <article
      className={cn(
        "group overflow-hidden rounded-2xl border-2 border-border bg-card text-left transition-all shadow-md",
        className,
      )}
    >
      <div
        className="relative flex h-16 items-end justify-end px-2 pb-1.5"
        style={{ backgroundColor: colorHex }}
      >
        <div className="absolute top-1.5 right-0 left-0 flex justify-center gap-1.5">
          {[0, 1, 2].map((index) => (
            <div
              key={index}
              className="size-3 rounded-full border"
              style={{
                backgroundColor: lightBackground
                  ? "rgba(0,0,0,0.12)"
                  : "rgba(255,255,255,0.18)",
                borderColor: lightBackground
                  ? "rgba(0,0,0,0.08)"
                  : "rgba(255,255,255,0.1)",
              }}
            />
          ))}
        </div>
        <span
          className="font-mono font-bold leading-none text-xs"
          style={{
            color: lightBackground
              ? "rgba(0,0,0,0.45)"
              : "rgba(255,255,255,0.55)",
          }}
        >
          #{part.partNum}
        </span>
      </div>

      <div className="px-3 py-2 w-full flex flex-col gap-1">
        <div
          className="truncate font-black text-xs leading-tight"
          title={part.partName}
        >
          {part.partName}
        </div>
        <div
          className="truncate text-muted-foreground text-xs"
          title={part.colorName}
        >
          {part.colorName}
        </div>
        <span
          className="font-black text-primary text-sm text-right"
          title={`Quantity: ${part.quantity}`}
        >
          ×{part.quantity}
        </span>
      </div>
    </article>
  )
}

export default OwnedPart
