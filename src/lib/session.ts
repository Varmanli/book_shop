import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { isAdminRole, isOwnerRole } from "@/lib/roles";
import * as userRepo from "@/repositories/user.repository";

export async function getSession() {
  return auth();
}

export async function requireAuth() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/auth/login");
  }

  const user = await userRepo.findUserById(session.user.id);
  if (!user) redirect("/auth/login");

  session.user.role = user.role;
  return session;
}

export async function requireAdmin() {
  const session = await requireAuth();
  const allowed = isAdminRole(session.user.role);
  if (process.env.AUTH_DEBUG_ADMIN_ACCESS === "true") {
    console.info("[auth] admin access", {
      userId: session.user.id,
      email: session.user.email,
      role: session.user.role,
      allowed,
    });
  }
  if (!allowed) {
    redirect("/");
  }
  return session;
}

export async function requireOwner() {
  const session = await requireAuth();
  if (!isOwnerRole(session.user.role)) {
    redirect("/");
  }
  return session;
}

export async function getCurrentUserId(): Promise<string | null> {
  const session = await auth();
  return session?.user?.id ?? null;
}

export function isAdmin(role?: string | null): boolean {
  return isAdminRole(role);
}
