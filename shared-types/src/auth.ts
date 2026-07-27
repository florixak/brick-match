import { z } from "zod";
import { ApiSuccessResponseSchema } from "./api-response";

export const PasswordSchema = z.string().min(8);
export type Password = z.infer<typeof PasswordSchema>;

export const CurrentPasswordSchema = z.string().min(1);

export const RegisterRequestSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  password: PasswordSchema,
});
export type RegisterRequest = z.infer<typeof RegisterRequestSchema>;

export const LoginRequestSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  password: CurrentPasswordSchema,
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

export const UpdateEmailRequestSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  currentPassword: CurrentPasswordSchema,
});
export type UpdateEmailRequest = z.infer<typeof UpdateEmailRequestSchema>;

export const UpdateEmailApiResponseSchema =
  ApiSuccessResponseSchema(AuthResponseSchema);

export type UpdateEmailApiResponse = z.infer<
  typeof UpdateEmailApiResponseSchema
>;

export const ChangePasswordRequestSchema = z
  .object({
    currentPassword: CurrentPasswordSchema,
    newPassword: PasswordSchema,
  })
  .refine((value) => value.currentPassword !== value.newPassword, {
    message: "New password must be different from current password",
    path: ["newPassword"],
  });

export type ChangePasswordRequest = z.infer<typeof ChangePasswordRequestSchema>;

export const DeleteAccountRequestSchema = z.object({
  currentPassword: CurrentPasswordSchema,
});
export type DeleteAccountRequest = z.infer<typeof DeleteAccountRequestSchema>;
