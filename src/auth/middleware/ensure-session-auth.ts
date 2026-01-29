import type { Request, Response, NextFunction } from "express";
import { AppError } from "../../errors/app-error.js";

/**
 * Session authentication middleware
 *
 * 前提：
 * - express-session 已啟用
 * - passport.session() 已執行
 * - deserializeUser 已負責驗證 session 合法性
 */

export async function ensureSessionAuth(
  req: Request,
  _res: Response,
  next: NextFunction,
) {
  try {
    if (!req.user) {
      return next(new AppError("Unauthenticated", 401));
    }
    // req.user 已經是「通過 deserializeUser 驗證」的 safe user
    return next();
  } catch (err) {
    next(err);
  }
}
