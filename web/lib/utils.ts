import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function absoluteUrl(path: string) {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"
  return `${base}${path}`
}

const themeColorClasses = [
  { bg: "bg-chart-1", text: "text-chart-1" },
  { bg: "bg-chart-2", text: "text-chart-2" },
  { bg: "bg-chart-3", text: "text-chart-3" },
  { bg: "bg-chart-4", text: "text-chart-4" },
  { bg: "bg-chart-5", text: "text-chart-5" },
] as const

function getThemeColorIndex(themeId: number) {
  return Math.abs(themeId) % themeColorClasses.length
}

export function getThemeDotClassName(themeId: number) {
  return themeColorClasses[getThemeColorIndex(themeId)].bg
}

export function getThemeTextClassName(themeId: number) {
  return themeColorClasses[getThemeColorIndex(themeId)].text
}

export function getFirstTwoLetters(str: string) {
  return str.slice(0, 2).toUpperCase()
}

export function formatSetNumber(
  setNum: string,
  includeHashtag: boolean = true,
) {
  return (includeHashtag ? "#" : "") + setNum.replace(/-1$/, "")
}

const SET_IMAGE_CDN_BASE =
  "https://www.lego.com/cdn/product-assets/product.img.pri"
const SET_IMAGE_QUERY =
  "format=webply&fit=bounds&quality=60&width=500&height=500&dpr=2"

// Strip Rebrickable variant suffix (e.g. 9441-1 → 9441) for LEGO.com asset paths.
export function getSetImageBaseNumber(setNum: string) {
  return setNum.replace(/-1$/, "")
}

function buildSetImageUrl(baseNumber: string, suffix: "prod" | "Prod") {
  return `${SET_IMAGE_CDN_BASE}/${baseNumber}_${suffix}.jpg?${SET_IMAGE_QUERY}`
}

// LEGO CDN filenames use inconsistent `_prod` vs `_Prod` casing per set.
export function getSetImageUrlCandidates(setNum: string) {
  const base = getSetImageBaseNumber(setNum)
  return [buildSetImageUrl(base, "prod"), buildSetImageUrl(base, "Prod")]
}

// Primary URL (lowercase `_prod`); use with onError → candidates[1].
export function getSetImageUrl(setNum: string) {
  return getSetImageUrlCandidates(setNum)[0]
}
