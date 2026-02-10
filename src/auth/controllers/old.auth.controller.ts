/**
 * @deprecated
 * Legacy implementation kept for reference only.
 * Not used by current routing.
 */

import type { Request, Response, NextFunction } from "express";
import { LoginSchema } from "../../types/auth.js";
import { AppError } from "../../errors/app-error.js";
import * as sessionController from "./auth.session.controller.js";
import { logger } from "../../logger/winston.logger.js";
// import * as jwtController from "./auth.jwt.controller.js"; // 未來

export async function login(req: Request, res: Response, next: NextFunction) {
  logger.info("auth.controller.ts req.body", { body: req.body });
  const parsed = LoginSchema.safeParse(req.body);

  if (!parsed.success) {
    throw new AppError("Invalid login payload", 400, {
      zodError: parsed.error.issues,
    });
  }
  logger.info("auth.controller parsed.data", { parsed: { ...parsed.data } });

  const { authStrategy } = parsed.data;
  // logger.info("auth.controller authStrategy", typeof(authStrategy) )
  // session
  if (authStrategy === "session") {
    return sessionController.login(req, res, next);
  } else {
    throw new AppError("Unsupported auth strategy", 400);
  }
}

export async function logout(req: Request, res: Response, next: NextFunction) {
  try {
    if (req.cookies?.sid) {
      return await sessionController.login(req, res, next);
    }
    /**
     * 即使沒有任何登入狀態
     * logout 仍然是 idempotent
     */
    return res.status(204).end();
  } catch (err) {
    return next(err);
  }
}
