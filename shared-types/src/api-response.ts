import { z } from "zod";

export const ApiSuccessResponseSchema = <T extends z.ZodTypeAny>(
  dataSchema: T,
) =>
  z.object({
    data: dataSchema,
    meta: z.record(z.string(), z.unknown()),
  });

export type ApiSuccessResponse<T> = {
  data: T;
  meta: Record<string, unknown>;
};

export const PaginationMetaSchema = z.object({
  page: z.number().int(),
  limit: z.number().int(),
  totalItems: z.number().int(),
  totalPages: z.number().int(),
});

export type PaginationMeta = z.infer<typeof PaginationMetaSchema>;

export const ApiSuccessResponseWithPaginationSchema = <T extends z.ZodTypeAny>(
  dataSchema: T,
) =>
  z.object({
    data: dataSchema,
    meta: PaginationMetaSchema,
  });

export type ApiSuccessResponseWithPagination<T> = {
  data: T;
  meta: PaginationMeta;
};

export const ApiErrorResponseSchema = z.object({
  statusCode: z.number().int(),
  message: z.string(),
  path: z.string(),
  timestamp: z.string(),
  errors: z.record(z.string(), z.array(z.string())).optional(),
});
export type ApiErrorResponse = z.infer<typeof ApiErrorResponseSchema>;
