import { z } from "zod";
import { ApiSuccessResponseSchema } from "./api-response";
import { MatchResultSchema } from "./domain";

export const GetMatchesQuerySchema = z.object({
  /** Cap on how many results to return, sorted by matchPercentage descending. */
  limit: z.number().int().positive().optional(),
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
