import { z } from "zod";

export const CatalogSearchMetaSchema = z.object({
  count: z.number().int().nonnegative(),
  limit: z.number().int().positive(),
});
export type CatalogSearchMeta = z.infer<typeof CatalogSearchMetaSchema>;

export const CatalogListMetaSchema = z.object({
  count: z.number().int().nonnegative(),
});
export type CatalogListMeta = z.infer<typeof CatalogListMetaSchema>;

export const SearchSetsQuerySchema = z.object({
  search: z.string().optional(),
  limit: z.coerce.number().int().positive().max(100).optional(),
});
export type SearchSetsQuery = z.infer<typeof SearchSetsQuerySchema>;

export const SetSummarySchema = z.object({
  setNum: z.string(),
  name: z.string(),
  year: z.number().int(),
  numParts: z.number().int().nonnegative(),
});
export type SetSummary = z.infer<typeof SetSummarySchema>;

export const SearchSetsResponseSchema = z.object({
  sets: z.array(SetSummarySchema),
});
export type SearchSetsResponse = z.infer<typeof SearchSetsResponseSchema>;

export const SearchSetsApiResponseSchema = z.object({
  data: SearchSetsResponseSchema,
  meta: CatalogSearchMetaSchema,
});
export type SearchSetsApiResponse = z.infer<typeof SearchSetsApiResponseSchema>;

export const SearchPartsQuerySchema = z.object({
  search: z.string().optional(),
  limit: z.coerce.number().int().positive().max(100).optional(),
});
export type SearchPartsQuery = z.infer<typeof SearchPartsQuerySchema>;

export const PartSummarySchema = z.object({
  partNum: z.string(),
  name: z.string(),
});
export type PartSummary = z.infer<typeof PartSummarySchema>;

export const SearchPartsResponseSchema = z.object({
  parts: z.array(PartSummarySchema),
});
export type SearchPartsResponse = z.infer<typeof SearchPartsResponseSchema>;

export const SearchPartsApiResponseSchema = z.object({
  data: SearchPartsResponseSchema,
  meta: CatalogSearchMetaSchema,
});
export type SearchPartsApiResponse = z.infer<
  typeof SearchPartsApiResponseSchema
>;

export const ColorSchema = z.object({
  colorId: z.number().int(),
  name: z.string(),
  rgb: z.string().length(6),
  isTrans: z.boolean(),
});
export type Color = z.infer<typeof ColorSchema>;

export const ColorsResponseSchema = z.object({
  colors: z.array(ColorSchema),
});
export type ColorsResponse = z.infer<typeof ColorsResponseSchema>;

export const ColorsApiResponseSchema = z.object({
  data: ColorsResponseSchema,
  meta: CatalogListMetaSchema,
});
export type ColorsApiResponse = z.infer<typeof ColorsApiResponseSchema>;

export const ThemeSchema = z.object({
  id: z.number().int(),
  name: z.string(),
  parentId: z.number().int().nullable(),
});
export type Theme = z.infer<typeof ThemeSchema>;

export const ThemesResponseSchema = z.object({
  themes: z.array(ThemeSchema),
});
export type ThemesResponse = z.infer<typeof ThemesResponseSchema>;

export const ThemesApiResponseSchema = z.object({
  data: ThemesResponseSchema,
  meta: CatalogListMetaSchema,
});
export type ThemesApiResponse = z.infer<typeof ThemesApiResponseSchema>;
