import passport from "passport";
import { prisma } from "../../libs/prisma.js";
import { logger } from "../../logger/winston.logger.js";

/**
 * serializeUser
 *
 * 決定「登入成功後，要在 session 裡存什麼」
 * ⚠️ 只存最小必要資訊，避免 session 膨脹
 */

// ✅ serializeUser：用窄型別斷言（或 any）
// Passport 的型別預設把 user 當 Express.User（SafeUser），但登入當下 strategy 可能給的是 prisma user。
// 這是 adapter 邊界，使用斷言是合理做法。
passport.serializeUser((user: Express.User, done) => {
  const u = user as { id?: number; securityStamp?: string };
  logger.info("passport.session.ts", {
    user: user
  })
  if (!u.id || !u.securityStamp) {
    return done(new Error("Invalid user for session serialization"));
  }

  return done(null, user.id);
});

/**
 * deserializeUser
 *
 * 每個 request 都會被呼叫，用來判斷：
 * - 這個 session 是否仍然有效
 * - 是否還能信任這個 user
 */
passport.deserializeUser(
  async (
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    payload: any,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    done: (err: any, user?: Express.User | false) => void,
  ) => {
    try {
      const user = await prisma.user.findUnique({
        where: { id: payload.userId },
        select: {
          id: true,
          name: true,
          email: true,
          securityStamp: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      // 使用者不存在 → session 失效
      if (!user) {
        return done(null, false);
      }

      // securityStamp 不一致 → 強制登出（session invalid）
      if (user.securityStamp !== payload.securityStamp) {
        return done(null, false);
      }

      // const { securityStamp: _securityStamp, ...safeUser } = user;

      return done(null, user);
    } catch (err) {
      return done(err);
    }
  },
);
