import { z } from "zod";
import { ApiSuccessResponseSchema } from "./api-response";

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

export const SearchSetsApiResponseSchema = ApiSuccessResponseSchema(
  SearchSetsResponseSchema,
);
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

export const SearchPartsApiResponseSchema = ApiSuccessResponseSchema(
  SearchPartsResponseSchema,
);
export type SearchPartsApiResponse = z.infer<
  typeof SearchPartsApiResponseSchema
>;

export const ColorSchema = z.object({
  colorId: z.number().int().positive(),
  name: z.string(),
  rgb: z.string().length(6),
  isTrans: z.boolean(),
});
export type Color = z.infer<typeof ColorSchema>;

export const ColorsResponseSchema = z.object({
  colors: z.array(ColorSchema),
});
export type ColorsResponse = z.infer<typeof ColorsResponseSchema>;

export const ColorsApiResponseSchema = ApiSuccessResponseSchema(
  ColorsResponseSchema,
);
export type ColorsApiResponse = z.infer<typeof ColorsApiResponseSchema>;
