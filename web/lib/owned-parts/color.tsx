import type { Color } from "@brick-match/shared-types"

const TRANSPARENT_CHECKERBOARD =
  "linear-gradient(45deg, #ccc 25%, transparent 25%), linear-gradient(-45deg, #ccc 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #ccc 75%), linear-gradient(-45deg, transparent 75%, #ccc 75%)"

export function toCssHex(rgb: string) {
  return rgb.startsWith("#") ? rgb : `#${rgb}`
}

function rgbToRgba(rgb: string, alpha: number) {
  const hex = rgb.replace("#", "")
  const red = Number.parseInt(hex.slice(0, 2), 16)
  const green = Number.parseInt(hex.slice(2, 4), 16)
  const blue = Number.parseInt(hex.slice(4, 6), 16)
  return `rgba(${red}, ${green}, ${blue}, ${alpha})`
}

type ColorSwatchProps = {
  rgb: string
  isTrans: boolean
  className?: string
}

export function ColorSwatch({
  rgb,
  isTrans,
  className = "size-3",
}: ColorSwatchProps) {
  if (!isTrans) {
    return (
      <span
        className={`inline-block shrink-0 rounded-sm border border-black/10 ${className}`}
        style={{ backgroundColor: toCssHex(rgb) }}
      />
    )
  }

  return (
    <span
      className={`relative inline-block shrink-0 overflow-hidden rounded-sm border border-black/20 ${className}`}
      style={{
        backgroundImage: TRANSPARENT_CHECKERBOARD,
        backgroundSize: "6px 6px",
        backgroundPosition: "0 0, 0 3px, 3px -3px, -3px 0",
      }}
    >
      <span
        className="absolute inset-0"
        style={{ backgroundColor: rgbToRgba(rgb, 0.55) }}
      />
    </span>
  )
}

export function isLightColor(hex: string) {
  const normalized = hex.replace("#", "")
  const red = Number.parseInt(normalized.slice(0, 2), 16)
  const green = Number.parseInt(normalized.slice(2, 4), 16)
  const blue = Number.parseInt(normalized.slice(4, 6), 16)
  const luminance = (0.299 * red + 0.587 * green + 0.114 * blue) / 255

  return luminance > 0.6
}

export function filterColorsByIds(
  colors: Color[],
  colorIds: readonly number[],
  includeColorIds: readonly number[] = [],
): Color[] {
  const idSet = new Set([...colorIds, ...includeColorIds])
  return colors.filter((color) => idSet.has(color.colorId))
}

export function toColorOptions(colors: Color[]) {
  return colors.map((color) => ({
    value: color.colorId,
    label: color.name,
    prefix: <ColorSwatch rgb={color.rgb} isTrans={color.isTrans} />,
  }))
}
