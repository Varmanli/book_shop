import * as userRepo from "@/repositories/user.repository";
import type { RegisterInput, UpdateProfileInput } from "@/validations/auth.schema";
import { normalizeEmail } from "@/lib/auth-utils";

export class DuplicateEmailError extends Error {
  constructor() {
    super("Duplicate email");
    this.name = "DuplicateEmailError";
  }
}

function isUniqueViolation(error: unknown): boolean {
  if (!error || typeof error !== "object") return false;

  if ("code" in error && error.code === "23505") return true;

  return error instanceof Error && isUniqueViolation(error.cause);
}

export async function registerUser(data: RegisterInput) {
  const userData = { ...data, email: normalizeEmail(data.email) };
  const exists = await userRepo.emailExists(userData.email);
  if (exists) throw new DuplicateEmailError();

  try {
    return await userRepo.createUser(userData);
  } catch (error) {
    if (isUniqueViolation(error)) throw new DuplicateEmailError();
    throw error;
  }
}

export async function updateProfile(
  userId: string,
  data: UpdateProfileInput
) {
  return userRepo.updateUser(userId, data);
}

export async function getUserById(id: string) {
  return userRepo.findUserById(id);
}
