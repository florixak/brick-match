import type { PartCategoriesApiResponse } from "@lego-matcher/shared-types"

export function toPartCategoryOptions(data: PartCategoriesApiResponse) {
  return data.data.partCategories.map((category) => ({
    value: category.id,
    label: category.name,
  }))
}
