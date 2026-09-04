import type { OwnedPartDetail } from "@brick-match/shared-types"
import PartAvatar from "@/components/search/part-avatar"
import { isLightColor, toCssHex } from "@/lib/owned-parts/color"
import { cn } from "@/lib/utils"

type OwnedPartProps = {
  part: OwnedPartDetail
  className?: string
  onClick: () => void
}

const OwnedPart = ({ part, className, onClick }: OwnedPartProps) => {
  const colorHex = toCssHex(part.colorRgb)
  const lightBackground = isLightColor(colorHex)

  return (
    <button
      type="button"
      className={cn(
        "group w-full overflow-hidden rounded-2xl border-2 border-border bg-card text-left shadow-md transition-colors hover:bg-accent/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        className,
      )}
      onClick={onClick}
    >
      <div
        className="relative flex h-20 items-center justify-center px-2"
        style={{ backgroundColor: colorHex }}
      >
        <PartAvatar
          partNum={part.partNum}
          colorId={part.colorId}
          size="lg"
          className="shadow-none"
        />
        <span
          className="absolute right-1.5 bottom-1 font-mono font-bold leading-none text-xs"
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
    </button>
  )
}

export default OwnedPart
