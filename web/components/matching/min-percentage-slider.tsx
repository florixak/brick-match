"use client"

import { FieldLabel } from "@/components/ui/field-label"
import { Slider } from "@/components/ui/slider"
import { cn } from "@/lib/utils"

type MinPercentageSliderProps = {
  id?: string
  /** Backend fraction between 0 and 1 */
  value: number
  onValueChange: (value: number) => void
  disabled?: boolean
  className?: string
}

const tickLabels = ["0%", "50%", "100%"] as const

function MinPercentageSlider({
  id = "min-match-percentage",
  value,
  onValueChange,
  disabled = false,
  className,
}: MinPercentageSliderProps) {
  const displayPercent = Math.round(value * 100)

  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <div className="flex items-center gap-2">
        <FieldLabel htmlFor={id}>Minimum Match</FieldLabel>
        <span className="font-black text-sm tabular-nums">
          {displayPercent}%
        </span>
      </div>

      <Slider
        id={id}
        min={0}
        max={100}
        step={5}
        disabled={disabled}
        value={[displayPercent]}
        onValueChange={(nextValue) => {
          const percent = Array.isArray(nextValue) ? nextValue[0] : nextValue
          if (percent !== undefined) {
            onValueChange(percent / 100)
          }
        }}
        className="[&_.slider-track]:bg-muted [&_.slider-range]:bg-primary"
      />

      <div className="grid grid-cols-3 font-semibold text-muted-foreground text-sm">
        {tickLabels.map((label, index) => (
          <span
            key={label}
            className={cn(
              index === 0 && "text-left",
              index === 1 && "text-center",
              index === 2 && "text-right",
            )}
          >
            {label}
          </span>
        ))}
      </div>
    </div>
  )
}

export default MinPercentageSlider
