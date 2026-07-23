import type { ColorsApiResponse } from "@lego-matcher/shared-types"

export function toCssHex(rgb: string) {
  return rgb.startsWith("#") ? rgb : `#${rgb}`
}

export function isLightColor(hex: string) {
  const normalized = hex.replace("#", "")
  const red = Number.parseInt(normalized.slice(0, 2), 16)
  const green = Number.parseInt(normalized.slice(2, 4), 16)
  const blue = Number.parseInt(normalized.slice(4, 6), 16)
  const luminance = (0.299 * red + 0.587 * green + 0.114 * blue) / 255

  return luminance > 0.6
}

export function toColorOptions(data: ColorsApiResponse) {
  return data.data.colors.map((color) => ({
    value: color.colorId,
    label: color.name,
    prefix: (
      <span
        className="inline-block size-3 shrink-0 rounded-sm border border-black/10"
        style={{ backgroundColor: toCssHex(color.rgb) }}
      />
    ),
  }))
}
