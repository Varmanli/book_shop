import { cacheTag } from "next/cache";
import { db } from "@/db";
import { teamMembers } from "@/db/schema/team";
import { asc, eq } from "drizzle-orm";
import { CACHE_TAGS } from "@/lib/cache-tags";

export async function getAllTeamMembers() {
  "use cache";
  cacheTag(CACHE_TAGS.teamMembers);

  return db
    .select()
    .from(teamMembers)
    .orderBy(asc(teamMembers.order));
}

export async function createTeamMember(data: {
  name: string;
  role: string;
  bio: string;
  image: string;
  order?: number;
}) {
  const [member] = await db.insert(teamMembers).values(data).returning();
  return member;
}

export async function updateTeamMember(
  id: string,
  data: Partial<{ name: string; role: string; bio: string; image: string; order: number }>
) {
  const [member] = await db
    .update(teamMembers)
    .set(data)
    .where(eq(teamMembers.id, id))
    .returning();
  return member;
}

export async function deleteTeamMember(id: string) {
  await db.delete(teamMembers).where(eq(teamMembers.id, id));
}
