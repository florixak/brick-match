import { z } from "zod";
import {
  ApiSuccessResponseSchema,
  ApiSuccessResponseWithPaginationSchema,
} from "./api-response";
import { ColorIdSchema, CoercedColorIdSchema, OwnedPartSchema } from "./domain";
import { PaginationQuerySchema } from "./pagination";

export const AddOwnedPartRequestSchema = z.object({
  partNum: z.string().min(1),
  colorId: ColorIdSchema,
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
  partCategoryId: z.number().int(),
  partCategoryName: z.string(),
});
export type OwnedPartDetail = z.infer<typeof OwnedPartDetailSchema>;

export const GetOwnedPartsQuerySchema = PaginationQuerySchema.extend({
  search: z.string().optional(),
  partCategoryId: z.coerce.number().int().min(1).optional(),
  colorId: CoercedColorIdSchema.optional(),
});
export type GetOwnedPartsQuery = z.infer<typeof GetOwnedPartsQuerySchema>;

export const GetOwnedPartsDataSchema = z.object({
  items: z.array(OwnedPartDetailSchema),
});
export type GetOwnedPartsData = z.infer<typeof GetOwnedPartsDataSchema>;

export const GetOwnedPartsApiResponseSchema =
  ApiSuccessResponseWithPaginationSchema(GetOwnedPartsDataSchema);
export type GetOwnedPartsApiResponse = z.infer<
  typeof GetOwnedPartsApiResponseSchema
>;

export const RemoveOwnedPartQuerySchema = z.object({
  partNum: z.string().min(1),
  colorId: CoercedColorIdSchema,
});
export type RemoveOwnedPartQuery = z.infer<typeof RemoveOwnedPartQuerySchema>;
