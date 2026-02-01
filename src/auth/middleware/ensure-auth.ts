import type { Request, Response, NextFunction } from "express";
import { ensureSessionAuth } from "./ensure-session-auth.js";
import { AppError } from "../../errors/app-error.js";
import { container } from "../../di/container.js";
import { jwtAuth } from "../jwt/jwt.middleware.js";
// import { ensureJwtAuth } from "./ensure-jwt-auth.js"; // 未來

export async function ensureAuth(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  // import { ensureJwtAuth } from "./ensure-jwt-auth.js"; // 未來
  // Session fallback
  const jwtAuthMiddleware = jwtAuth(container.jwtService);

  const authHeader = req.headers.authorization;

  // 1️⃣ 有 Bearer token → JWT
  if (authHeader?.startsWith("Bearer")) {
    return jwtAuthMiddleware;
  }

  // 2️⃣ 沒有 Bearer → session
  if (req.cookies?.sid) {
    return ensureSessionAuth(req, res, next);
  }

  return next(new AppError("Unauthenticated", 401));
}
