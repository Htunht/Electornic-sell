import { Response } from "express";
import { AuthenticatedRequest } from "../../middleware/auth";
import * as userService from "../../service/userService";
import { ServiceError } from "../../service/userService";
import { Role } from "@prisma/client";

// GET /api/admin/users
export async function listUsers(req: AuthenticatedRequest, res: Response) {
  try {
    const { role, page, limit, search } = req.query;

    const result = await userService.listUsers({
      role: role as Role | undefined,
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
      search: search as string | undefined,
    });

    return res.json(result);
  } catch (error) {
    return handleError(res, error);
  }
}

// GET /api/admin/users/:id
export async function getUser(req: AuthenticatedRequest, res: Response) {
  try {
    const user = await userService.getUserById(req.params.id as string);
    return res.json(user);
  } catch (error) {
    return handleError(res, error);
  }
}

// POST /api/admin/users
export async function createUser(req: AuthenticatedRequest, res: Response) {
  try {
    const { email, password, role } = req.body;
    if (!email) return res.status(400).json({ message: "Email is required." });

    const user = await userService.createUser({ email, password, role });
    return res.status(201).json(user);
  } catch (error) {
    return handleError(res, error);
  }
}

// PATCH /api/admin/users/:id/role
export async function changeRole(req: AuthenticatedRequest, res: Response) {
  try {
    const { role } = req.body;
    if (!role || !Object.values(Role).includes(role)) {
      return res.status(400).json({ message: "Valid role is required." });
    }

    const user = await userService.changeUserRole(req.params.id as string, role);
    return res.json(user);
  } catch (error) {
    return handleError(res, error);
  }
}

// DELETE /api/admin/users/:id
export async function deleteUser(req: AuthenticatedRequest, res: Response) {
  try {
    await userService.removeUser(req.params.id as string);
    return res.json({ message: "User deleted." });
  } catch (error) {
    return handleError(res, error);
  }
}

// ---------------------------------------------------------------------------
// Error handler
// ---------------------------------------------------------------------------

function handleError(res: Response, error: unknown) {
  if (error instanceof ServiceError) {
    return res.status(error.status).json({ message: error.message });
  }
  console.error("Controller error:", error);
  return res.status(500).json({ message: "Internal server error." });
}
