import passport from "passport";
import { prisma } from "../../libs/prisma.js";

type SessionPayload = {
  userId: number;
  securityStamp: string;
};

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
  if (!user) {
    return done(new Error("Invalid user data"));
  }
  return done(null, { userId: user.id, securityStamp: user.securityStamp });
});

/**
 * deserializeUser
 *
 * 每個 request 都會被呼叫，用來判斷：
 * - 這個 session 是否仍然有效
 * - 是否還能信任這個 user
 */
passport.deserializeUser(async (payload: SessionPayload, done) => {
  try {
    if (
      !payload ||
      typeof payload !== "object" ||
      typeof payload.userId !== "number" ||
      typeof payload.securityStamp !== "string"
    ) {
      return done(null, false);
    }

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

    if (!user) {
      return done(null, false);
    }
    if (user.securityStamp !== payload.securityStamp) {
      return done(null, false);
    }

    return done(null, user);
  } catch (err) {
    return done(err);
  }
});
