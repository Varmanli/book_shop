import { and, asc, eq, ilike, isNull, or } from "drizzle-orm";
import { db } from "@/db";
import {
  ownerControl,
  roleAuditLogs,
  users,
} from "@/db/schema";
import type { UserRole } from "@/lib/roles";

const OWNER_CONTROL_ID = 1;
const PAGE_SIZE = 25;

export class RoleManagementError extends Error {
  constructor(
    public readonly code:
      | "OWNER_EXISTS"
      | "TARGET_NOT_FOUND"
      | "OWNER_PROTECTED"
      | "INVALID_TRANSITION"
  ) {
    super(code);
    this.name = "RoleManagementError";
  }
}

export type RoleUser = {
  id: string;
  name: string | null;
  email: string | null;
  role: UserRole;
  createdAt: Date;
};

function roleUserColumns() {
  return {
    id: users.id,
    name: users.name,
    email: users.email,
    role: users.role,
    createdAt: users.createdAt,
  };
}

export async function ownerExists(): Promise<boolean> {
  const owner = await db.query.ownerControl.findFirst({
    where: eq(ownerControl.id, OWNER_CONTROL_ID),
    columns: { ownerUserId: true },
  });
  return !!owner?.ownerUserId;
}

export async function listRoleUsers(search = "", page = 1): Promise<{
  users: RoleUser[];
  page: number;
  hasNextPage: boolean;
}> {
  const safePage = Math.max(1, page);
  const query = search.trim();
  const where = query
    ? or(ilike(users.email, `%${query}%`), ilike(users.name, `%${query}%`))
    : undefined;
  const rows = await db
    .select(roleUserColumns())
    .from(users)
    .where(where)
    .orderBy(asc(users.createdAt), asc(users.id))
    .limit(PAGE_SIZE + 1)
    .offset((safePage - 1) * PAGE_SIZE);

  return {
    users: rows.slice(0, PAGE_SIZE),
    page: safePage,
    hasNextPage: rows.length > PAGE_SIZE,
  };
}

export async function assignInitialOwner(targetUserId: string) {
  return db.transaction(async (tx) => {
    const [target] = await tx
      .select({ id: users.id, role: users.role })
      .from(users)
      .where(eq(users.id, targetUserId))
      .limit(1);
    if (!target) throw new RoleManagementError("TARGET_NOT_FOUND");

    const claimed = await tx
      .update(ownerControl)
      .set({ ownerUserId: target.id, assignedAt: new Date() })
      .where(
        and(
          eq(ownerControl.id, OWNER_CONTROL_ID),
          isNull(ownerControl.ownerUserId)
        )
      )
      .returning({ ownerUserId: ownerControl.ownerUserId });
    if (claimed.length !== 1) throw new RoleManagementError("OWNER_EXISTS");

    await tx.update(users).set({ role: "OWNER" }).where(eq(users.id, target.id));
    await tx.insert(roleAuditLogs).values({
      actorUserId: null,
      targetUserId: target.id,
      action: "OWNER_ASSIGNED",
      previousRole: target.role,
      newRole: "OWNER",
    });
  });
}

export async function grantAdminRole(actorUserId: string, targetUserId: string) {
  return changeAdminRole(actorUserId, targetUserId, "USER", "ADMIN", "ADMIN_GRANTED");
}

export async function revokeAdminRole(actorUserId: string, targetUserId: string) {
  return changeAdminRole(actorUserId, targetUserId, "ADMIN", "USER", "ADMIN_REVOKED");
}

async function changeAdminRole(
  actorUserId: string,
  targetUserId: string,
  from: "USER" | "ADMIN",
  to: "USER" | "ADMIN",
  action: "ADMIN_GRANTED" | "ADMIN_REVOKED"
) {
  return db.transaction(async (tx) => {
    const [target] = await tx
      .select({ id: users.id, role: users.role })
      .from(users)
      .where(eq(users.id, targetUserId))
      .limit(1);
    if (!target) throw new RoleManagementError("TARGET_NOT_FOUND");
    if (target.role === "OWNER") throw new RoleManagementError("OWNER_PROTECTED");
    if (target.role !== from) throw new RoleManagementError("INVALID_TRANSITION");

    const updated = await tx
      .update(users)
      .set({ role: to })
      .where(and(eq(users.id, target.id), eq(users.role, from)))
      .returning({ id: users.id });
    if (updated.length !== 1) throw new RoleManagementError("INVALID_TRANSITION");
    await tx.insert(roleAuditLogs).values({
      actorUserId,
      targetUserId: target.id,
      action,
      previousRole: from,
      newRole: to,
    });
  });
}
