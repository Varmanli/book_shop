import { eq } from "drizzle-orm";
import { db } from "@/db";
import { users } from "@/db/schema";
import { hashPassword } from "@/lib/password";
import type { RegisterInput } from "@/validations/auth.schema";

export async function findUserByEmail(email: string) {
  return db.query.users.findFirst({ where: eq(users.email, email) });
}

export async function findUserById(id: string) {
  return db.query.users.findFirst({ where: eq(users.id, id) });
}

export async function createUser(data: RegisterInput) {
  const hashed = await hashPassword(data.password);
  const [user] = await db
    .insert(users)
    .values({
      name: data.name,
      email: data.email,
      password: hashed,
      role: "USER",
    })
    .returning();
  return user;
}

export async function updateUser(
  id: string,
  data: Partial<Pick<typeof users.$inferInsert, "name" | "image" | "password">>
) {
  const updateData: Partial<typeof users.$inferInsert> = {
    ...data,
    updatedAt: new Date(),
  };
  if (data.password) {
    updateData.password = await hashPassword(data.password);
  }
  const [updated] = await db
    .update(users)
    .set(updateData)
    .where(eq(users.id, id))
    .returning();
  return updated;
}

export async function emailExists(email: string): Promise<boolean> {
  const user = await db.query.users.findFirst({
    where: eq(users.email, email),
    columns: { id: true },
  });
  return !!user;
}
