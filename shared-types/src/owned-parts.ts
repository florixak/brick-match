import { z } from "zod";
import { ApiSuccessResponseSchema } from "./api-response";
import { OwnedPartSchema } from "./domain";
import { paginatedResponseSchema } from "./pagination";

export const AddOwnedPartRequestSchema = z.object({
  partNum: z.string().min(1),
  colorId: z.number().int().positive(),
  quantity: z.number().int().positive(),
});
export type AddOwnedPartRequest = z.infer<typeof AddOwnedPartRequestSchema>;

export const AddSetRequestSchema = z.object({
  setNum: z.string().min(1),
});
export type AddSetRequest = z.infer<typeof AddSetRequestSchema>;

export const OwnedPartsResponseSchema = z.object({
  parts: z.array(OwnedPartSchema),
});
export type OwnedPartsResponse = z.infer<typeof OwnedPartsResponseSchema>;

export const AddOwnedPartResponseSchema = OwnedPartSchema;
export type AddOwnedPartResponse = z.infer<typeof AddOwnedPartResponseSchema>;

export const AddSetResponseSchema = OwnedPartsResponseSchema;
export type AddSetResponse = z.infer<typeof AddSetResponseSchema>;

export const OwnedPartsApiResponseSchema = ApiSuccessResponseSchema(
  OwnedPartsResponseSchema,
);
export type OwnedPartsApiResponse = z.infer<typeof OwnedPartsApiResponseSchema>;

export const AddOwnedPartApiResponseSchema = ApiSuccessResponseSchema(
  AddOwnedPartResponseSchema,
);
export type AddOwnedPartApiResponse = z.infer<
  typeof AddOwnedPartApiResponseSchema
>;

export const AddSetApiResponseSchema =
  ApiSuccessResponseSchema(AddSetResponseSchema);
export type AddSetApiResponse = z.infer<typeof AddSetApiResponseSchema>;

export const OwnedPartDetailSchema = OwnedPartSchema.extend({
  partName: z.string(),
  colorName: z.string(),
  colorRgb: z.string(),
});
export type OwnedPartDetail = z.infer<typeof OwnedPartDetailSchema>;

export const GetOwnedPartsResponseSchema = paginatedResponseSchema(
  OwnedPartDetailSchema,
);
export type GetOwnedPartsResponse = z.infer<typeof GetOwnedPartsResponseSchema>;
