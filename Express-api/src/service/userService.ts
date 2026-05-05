import { Role } from "@prisma/client";
import * as userRepo from "../respositry/userRepository";

// ---------------------------------------------------------------------------
// Queries
// ---------------------------------------------------------------------------

export async function getUserById(id: string) {
  const user = await userRepo.findUserById(id);
  if (!user) throw new ServiceError(404, "User not found.");
  return user;
}

export async function getUserByEmail(email: string) {
  return userRepo.findUserByEmail(email);
}

export async function listUsers(params?: {
  role?: Role;
  page?: number;
  limit?: number;
  search?: string;
}) {
  return userRepo.findAllUsers(params);
}

// ---------------------------------------------------------------------------
// Mutations
// ---------------------------------------------------------------------------

export async function createUser(data: {
  email: string;
  name?: string;
  password?: string;
  role?: Role;
}) {
  const existing = await userRepo.findUserByEmail(data.email);
  if (existing) throw new ServiceError(409, "Email already in use.");
  return userRepo.createUser(data);
}

export async function changeUserRole(id: string, role: Role) {
  await getUserById(id); // ensure exists
  return userRepo.updateUserRole(id, role);
}

export async function removeUser(id: string) {
  await getUserById(id); // ensure exists
  return userRepo.deleteUser(id);
}

// ---------------------------------------------------------------------------
// Error helper
// ---------------------------------------------------------------------------

export class ServiceError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
    this.name = "ServiceError";
  }
}
