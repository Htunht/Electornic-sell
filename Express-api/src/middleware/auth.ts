import { Request, Response, NextFunction } from "express";
import prisma from "../lib/prisma";
import { Role } from "@prisma/client";
import { auth } from "../lib/auth";

// ---------------------------------------------------------------------------
// Type Definitions
// ---------------------------------------------------------------------------

/** Authenticated user session stored on the request */
export interface SessionUser {
  id: string;
  email: string;
  name: string;
  role: Role;
}

/**
 * Express request with a **guaranteed** authenticated user.
 * Use in handlers behind `authGuard`, `adminGuard`, or `requireRole`.
 */
export interface AuthenticatedRequest extends Request {
  user: SessionUser;
}

/**
 * Express request where user **may or may not** be present.
 * Use in handlers behind `optionalAuth`.
 */
export interface OptionalAuthRequest extends Request {
  user?: SessionUser;
}

// ---------------------------------------------------------------------------
// Internal: extract user from better-auth session
// ---------------------------------------------------------------------------

/**
 * Converts Express IncomingHttpHeaders to a fetch-compatible Headers object.
 * Express headers can have string | string[] values; the Headers API requires strings.
 */
function toFetchHeaders(expressHeaders: Request["headers"]): Headers {
  const headers = new Headers();
  for (const [key, value] of Object.entries(expressHeaders)) {
    if (value === undefined) continue;
    if (Array.isArray(value)) {
      // Join array values with comma (standard HTTP multi-header encoding)
      headers.set(key, value.join(", "));
    } else {
      headers.set(key, value);
    }
  }
  return headers;
}

/**
 * Extracts the authenticated user from the better-auth session cookie.
 */
async function extractUser(req: Request): Promise<SessionUser | null> {
  try {
    const session = await auth.api.getSession({
      headers: toFetchHeaders(req.headers),
    });

    if (!session?.user) {
      return null;
    }

    // Re-fetch from DB to get the latest role (better-auth session may be stale)
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { id: true, email: true, name: true, role: true },
    });

    if (!user) return null;

    return { id: user.id, email: user.email, name: user.name, role: user.role as Role };
  } catch (error) {
    console.error("[AUTH] extractUser error:", error);
    return null;
  }
}

// ---------------------------------------------------------------------------
// Middleware
// ---------------------------------------------------------------------------

/**
 * Requires a valid session – returns 401 if not signed in.
 */
export async function authGuard(req: Request, res: Response, next: NextFunction) {
  const user = await extractUser(req);
  if (!user) {
    return res.status(401).json({ message: "Unauthorized: Please sign in." });
  }
  (req as AuthenticatedRequest).user = user;
  next();
}

/**
 * Attaches user if present, but never blocks the request.
 */
export async function optionalAuth(req: Request, res: Response, next: NextFunction) {
  const user = await extractUser(req);
  if (user) (req as OptionalAuthRequest).user = user;
  next();
}

/**
 * Requires `SUPER_ADMIN` role.
 */
export async function adminGuard(req: Request, res: Response, next: NextFunction) {
  const user = await extractUser(req);

  if (!user) {
    return res.status(401).json({ message: "Unauthorized: Please sign in." });
  }

  if (user.role !== "TEACHER") {
    console.warn(`[AUTH] adminGuard: ${user.email} attempted admin access with role ${user.role}`);
    return res.status(403).json({ message: "Forbidden: Super Admin privileges required." });
  }

  (req as AuthenticatedRequest).user = user;
  next();
}

/**
 * Factory: requires one of the specified roles.
 *
 * @example
 * router.get("/results", requireRole("SUPER_ADMIN", "MAJOR_HEAD"), handler);
 */
export function requireRole(...roles: Role[]) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const user = await extractUser(req);

    if (!user) {
      return res.status(401).json({ message: "Unauthorized: Please sign in." });
    }

    if (!roles.includes(user.role)) {
      console.warn(`[AUTH] requireRole: ${user.email} (${user.role}) tried to access route requiring [${roles.join(", ")}]`);
      return res.status(403).json({
        message: `Forbidden: Requires one of [${roles.join(", ")}] role.`,
      });
    }

    console.log(`[AUTH] Authenticated: ${user.email} (ID: ${user.id}, Role: ${user.role})`);
    (req as AuthenticatedRequest).user = user;
    next();
  };
}
