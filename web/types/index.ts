// Shared type definitions
// Convention: use `as const` + derived union types instead of enums
// Example:
//   export const STATUS = { Active: "active", Inactive: "inactive" } as const
//   export type Status = (typeof STATUS)[keyof typeof STATUS]
