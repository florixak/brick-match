import { z } from "zod";
import { OwnedPartSchema } from "./domain";

/** Manually add (or increment) a single part+color the user owns. */
export const AddOwnedPartRequestSchema = z.object({
  partNum: z.string().min(1),
  colorId: z.number().int().nonnegative(),
  quantity: z.number().int().positive(),
});
export type AddOwnedPartRequest = z.infer<typeof AddOwnedPartRequestSchema>;

/** Add a whole set by number — the backend expands its inventory_parts into user_owned_parts. */
export const AddSetRequestSchema = z.object({
  setNum: z.string().min(1),
});
export type AddSetRequest = z.infer<typeof AddSetRequestSchema>;

export const OwnedPartsResponseSchema = z.object({
  parts: z.array(OwnedPartSchema),
});
export type OwnedPartsResponse = z.infer<typeof OwnedPartsResponseSchema>;
