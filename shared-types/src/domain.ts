import { z } from "zod";

export const PartRefSchema = z.object({
  partNum: z.string(),
  colorId: z.number().int(),
});
export type PartRef = z.infer<typeof PartRefSchema>;

export const OwnedPartSchema = PartRefSchema.extend({
  quantity: z.number().int().positive(),
});
export type OwnedPart = z.infer<typeof OwnedPartSchema>;

export const MissingPartSchema = PartRefSchema.extend({
  quantity: z.number().int().positive(),
});
export type MissingPart = z.infer<typeof MissingPartSchema>;

export const MatchResultSchema = z.object({
  setNum: z.string(),
  setName: z.string(),
  /** Fraction between 0 and 1, not a 0–100 percentage — multiply by 100 only at display time. */
  matchPercentage: z.number().min(0).max(1),
  missingParts: z.array(MissingPartSchema),
});
export type MatchResult = z.infer<typeof MatchResultSchema>;
