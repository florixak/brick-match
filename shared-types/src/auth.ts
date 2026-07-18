import { z } from "zod";
import { ApiSuccessResponseSchema } from "./api-response";

export const RegisterRequestSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(8),
});
export type RegisterRequest = z.infer<typeof RegisterRequestSchema>;

export const LoginRequestSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(1),
});
export type LoginRequest = z.infer<typeof LoginRequestSchema>;

export const AuthUserSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
});
export type AuthUser = z.infer<typeof AuthUserSchema>;

export const AuthResponseSchema = z.object({
  user: AuthUserSchema,
});
export type AuthResponse = z.infer<typeof AuthResponseSchema>;

export const LoginApiResponseSchema =
  ApiSuccessResponseSchema(AuthResponseSchema);
export type LoginApiResponse = z.infer<typeof LoginApiResponseSchema>;

export const RegisterApiResponseSchema =
  ApiSuccessResponseSchema(AuthResponseSchema);
export type RegisterApiResponse = z.infer<typeof RegisterApiResponseSchema>;

export const MeApiResponseSchema = ApiSuccessResponseSchema(AuthResponseSchema);
export type MeApiResponse = z.infer<typeof MeApiResponseSchema>;
