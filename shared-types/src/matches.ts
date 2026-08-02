import { z } from "zod";
import { ApiSuccessResponseSchema } from "./api-response";
import { MatchResultSchema } from "./domain";

export const DEFAULT_MIN_MATCH_PERCENTAGE = 0.1;

export const GetMatchesQuerySchema = z.object({
  limit: z.coerce.number().int().positive().max(200).optional(),
  /** Fraction between 0 and 1 */
  minMatchPercentage: z.coerce.number().min(0).max(1).optional(),
  themeId: z.coerce.number().int().positive().optional(),
});
export type GetMatchesQuery = z.infer<typeof GetMatchesQuerySchema>;

export const GetMatchesResponseSchema = z.object({
  results: z.array(MatchResultSchema),
});
export type GetMatchesResponse = z.infer<typeof GetMatchesResponseSchema>;

export const GetMatchesApiResponseSchema = ApiSuccessResponseSchema(
  GetMatchesResponseSchema,
);
export type GetMatchesApiResponse = z.infer<typeof GetMatchesApiResponseSchema>;

export const CompleteSetResponseSchema = z.object({
  partsAffected: z.number().int(),
});
export type CompleteSetResponse = z.infer<typeof CompleteSetResponseSchema>;

export const CompleteSetApiResponseSchema = ApiSuccessResponseSchema(
  CompleteSetResponseSchema,
);
export type CompleteSetApiResponse = z.infer<typeof CompleteSetApiResponseSchema>;
