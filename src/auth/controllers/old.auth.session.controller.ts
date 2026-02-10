/**
 * @deprecated
 * Legacy implementation kept for reference only.
 * Not used by current routing.
 */

import passport from "passport";
import { container } from "../../di/container.js";
import { AppError } from "../../errors/app-error.js";
import type { Request, Response, NextFunction } from "express";
import type { User } from "../../generated/prisma/client.js";

/**
 * Session-based authentication controller
 * 使用 passport-local + DB session
 */

/**
 * POST /auth/login
 */
export function login(req: Request, res: Response, next: NextFunction) {
  // user 要使用 passport 定義的 Express.User
  passport.authenticate(
    "local",
    { session: false },
    async (err: unknown, user: Express.User | false | null) => {
      if (err) return next(err);
      if (!user) {
        // passport.authenticate 的 callback
        // 不是 Express middleware
        // throw 不一定會被 Express error middleware 接到
        // throw new AppError("Invalid credentials", 401); // throw 錯誤用法
        return next(new AppError("Invalid credentials", 401));
      }
      // req.user 已由 passport-local 設定
      // ! 是 typescript Non-null Assertion Operator（非空斷言），表示值一定存在

      // 內部 再收斂型別 外部框架邊界：寬； 你自己系統內部：嚴
      // type 型別收斂，將寬泛定義的 Express.User 轉為 passport User type
      const authUser = user as User;
      try {
        const sessionServices = container.session.services;
        const session = await sessionServices.createSession(user.id);

        res.cookie("sid", session.id, {
          httpOnly: true,
          sameSite: "lax",
          // secure: true, // production + https
        });

        return res.status(200).json({
          user: {
            id: authUser.id,
            name: authUser.name,
            email: authUser.email,
          },
          authType: "session",
        });
      } catch (err) {
        return next(err);
      }
    },
  )(req, res, next);
}

/**
 * POST /auth/logout
 */
export async function logout(req: Request, res: Response) {
  const sessionServices = container.session.services;

  const sid = req.cookies?.sid;
  if (sid) {
    await sessionServices.revokeSession(sid);
    res.clearCookie("sid");
  }

  // logout 必須是 idempotent
  res.status(204).end();
}
