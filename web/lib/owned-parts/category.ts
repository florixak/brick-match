import type { PartCategory } from "@brick-match/shared-types"

export function toPartCategoryOptions(categories: PartCategory[]) {
  return categories.map((category) => ({
    value: category.id,
    label: category.name,
  }))
}
