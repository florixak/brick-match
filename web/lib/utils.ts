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

export function formatSetNumber(setNum: string) {
  return setNum.replace(/-1$/, "")
}
