import type { PartCategory } from "@lego-matcher/shared-types"

export function toPartCategoryOptions(categories: PartCategory[]) {
  return categories.map((category) => ({
    value: category.id,
    label: category.name,
  }))
}
