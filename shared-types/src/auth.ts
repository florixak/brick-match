import { z } from "zod";
import { ApiSuccessResponseSchema } from "./api-response";

export const RegisterRequestSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});
export type RegisterRequest = z.infer<typeof RegisterRequestSchema>;

export const LoginRequestSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});
export type LoginRequest = z.infer<typeof LoginRequestSchema>;

export const AuthResponseSchema = z.object({
  accessToken: z.string(),
});
export type AuthResponse = z.infer<typeof AuthResponseSchema>;

export const LoginApiResponseSchema =
  ApiSuccessResponseSchema(AuthResponseSchema);
export type LoginApiResponse = z.infer<typeof LoginApiResponseSchema>;

export const RegisterApiResponseSchema =
  ApiSuccessResponseSchema(AuthResponseSchema);
export type RegisterApiResponse = z.infer<typeof RegisterApiResponseSchema>;
