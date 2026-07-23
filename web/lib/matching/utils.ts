import type { Theme, ThemesApiResponse } from "@lego-matcher/shared-types"

function buildThemeLabel(theme: Theme, index: Map<number, Theme>): string {
  const parts: string[] = [theme.name]
  let current = theme

  while (current.parentId !== null) {
    const parent = index.get(current.parentId)
    if (!parent) break
    parts.unshift(parent.name)
    current = parent
  }

  return parts.join(" > ")
}

export function toThemeOptions(data: ThemesApiResponse) {
  const index = new Map(data.data.themes.map((t) => [t.id, t]))

  return data.data.themes
    .map((theme) => ({
      value: theme.id,
      label: buildThemeLabel(theme, index),
    }))
    .toSorted((a, b) => a.label.localeCompare(b.label))
}
