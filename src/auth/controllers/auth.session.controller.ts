import passport from "passport";
import type { Request, Response, NextFunction } from "express";
// import { container } from "../../di/container.js";
import { AppError } from "../../errors/app-error.js";
import { logger } from "../../logger/index.js";
import { syncExpressSession } from "../utils/sync-express-session.js";

type LoginUser = Express.User & { securityStamp: string };
/**
 * POST /auth/login
 * Session-based login (express-session)
 */

export async function login(req: Request, res: Response, next: NextFunction) {
  passport.authenticate("local", (err: unknown, user: LoginUser | false) => {
    if (err) return next(err);
    // logger.info("auth.session.controller.ts user", { user });
    if (!user) return next(new AppError("Invalid credentials", 401));

    // 🔑 關鍵：交給 passport + express-session


    req.logIn(user, async (err) => {
      if (err) return next(err);
      req.session.save(async (err) => {
        if(err) return next(err)
        // ⭐ 關鍵新增
        const sid = req.sessionID;
        await syncExpressSession(sid, user.id, user.securityStamp);

      })


      logger.error("req.login Error (Serialization failed)", {
        error: "loginErr",
        body: req.body,
      });
      // logger.info("auth.session.controller.ts req.logIn user", { user });
      return res.status(200).json({
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
        },
        authType: "session",
      });
    });
  })(req, res, next);
}

/**
 * POST /auth/logout
 * Session-based logout (express-session)
 */
export function logout(req: Request, res: Response, next: NextFunction) {
  req.logout((err) => {
    if (err) return next(err);

    // destroy session store
    req.session.destroy(() => {
      res.clearCookie("sid"); // cookie name 你在 app.ts 設的
      res.status(204).end();
    });
  });
}
