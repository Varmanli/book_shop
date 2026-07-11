export const USER_ROLES = ["USER", "ADMIN", "OWNER"] as const;

export type UserRole = (typeof USER_ROLES)[number];

export function isUserRole(value: unknown): value is UserRole {
  return typeof value === "string" && USER_ROLES.includes(value as UserRole);
}

export function isAdminRole(role: UserRole): boolean {
  return role === "ADMIN" || role === "OWNER";
}

export function isOwnerRole(role: UserRole): boolean {
  return role === "OWNER";
}
