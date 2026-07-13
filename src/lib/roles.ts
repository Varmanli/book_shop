export const USER_ROLES = ["USER", "ADMIN", "OWNER"] as const;

export type UserRole = (typeof USER_ROLES)[number];

export function isUserRole(value: unknown): value is UserRole {
  return typeof value === "string" && USER_ROLES.includes(value as UserRole);
}

export function isAdminRole(role: unknown): role is "ADMIN" | "OWNER" {
  return role === "ADMIN" || role === "OWNER";
}

export function isOwnerRole(role: unknown): role is "OWNER" {
  return role === "OWNER";
}
