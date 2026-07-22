import type {
  ColorsApiResponse,
  PartCategoriesApiResponse,
} from "@lego-matcher/shared-types"

export function toColorOptions(data: ColorsApiResponse) {
  return data.data.colors.map((color) => ({
    value: color.colorId,
    label: color.name,
  }))
}

export function toPartCategoryOptions(data: PartCategoriesApiResponse) {
  return data.data.partCategories.map((category) => ({
    value: category.id,
    label: category.name,
  }))
}
