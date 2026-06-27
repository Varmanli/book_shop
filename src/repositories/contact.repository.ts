import { cacheTag } from "next/cache";
import { db } from "@/db";
import { contactMessages } from "@/db/schema/contact";
import type { CreateContactMessageInput, UpdateContactStatusInput } from "@/validations/contact.schema";
import { desc, eq } from "drizzle-orm";
import { CACHE_TAGS } from "@/lib/cache-tags";

export async function createContactMessage(data: CreateContactMessageInput) {
  const [message] = await db
    .insert(contactMessages)
    .values(data)
    .returning();
  return message;
}

export async function getAllContactMessages() {
  "use cache";
  cacheTag(CACHE_TAGS.contactMessages);

  return db
    .select()
    .from(contactMessages)
    .orderBy(desc(contactMessages.createdAt));
}

export async function getContactMessageById(id: string) {
  "use cache";
  cacheTag(CACHE_TAGS.contactMessage(id), CACHE_TAGS.contactMessages);

  const [message] = await db
    .select()
    .from(contactMessages)
    .where(eq(contactMessages.id, id));
  return message ?? null;
}

export async function updateContactMessageStatus(
  id: string,
  data: UpdateContactStatusInput
) {
  const [message] = await db
    .update(contactMessages)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(contactMessages.id, id))
    .returning();
  return message;
}

export async function deleteContactMessage(id: string) {
  await db.delete(contactMessages).where(eq(contactMessages.id, id));
}

export async function getUnreadContactCount() {
  "use cache";
  cacheTag(CACHE_TAGS.contactMessages);

  const messages = await db
    .select({ id: contactMessages.id })
    .from(contactMessages)
    .where(eq(contactMessages.status, "UNREAD"));
  return messages.length;
}
