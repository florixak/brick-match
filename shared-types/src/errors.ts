import { z } from "zod";

export const ApiErrorResponseSchema = z.object({
  statusCode: z.number().int(),
  message: z.string(),
});
export type ApiErrorResponse = z.infer<typeof ApiErrorResponseSchema>;
