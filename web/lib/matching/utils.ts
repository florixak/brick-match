import type { Theme } from "@lego-matcher/shared-types"

function buildThemeLabel(theme: Theme, index: Map<number, Theme>): string {
  const parts: string[] = [theme.name]
  let current = theme
  const visited = new Set<number>([theme.id])

  while (current.parentId !== null) {
    if (visited.has(current.parentId)) break
    const parent = index.get(current.parentId)
    if (!parent) break
    visited.add(parent.id)
    parts.unshift(parent.name)
    current = parent
  }

  return parts.join(" > ")
}

export function toThemeOptions(themes: Theme[]) {
  const index = new Map(themes.map((t) => [t.id, t]))

  return themes
    .map((theme) => ({
      value: theme.id,
      label: buildThemeLabel(theme, index),
    }))
    .toSorted((a, b) => a.label.localeCompare(b.label))
}
