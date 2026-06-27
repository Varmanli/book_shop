import * as userRepo from "@/repositories/user.repository";
import type { RegisterInput, UpdateProfileInput } from "@/validations/auth.schema";

export async function registerUser(data: RegisterInput) {
  const exists = await userRepo.emailExists(data.email);
  if (exists) throw new Error("این ایمیل قبلاً ثبت شده است");
  return userRepo.createUser(data);
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
