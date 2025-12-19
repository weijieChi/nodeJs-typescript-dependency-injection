import { Strategy as LocalStrategy } from "passport-local";
import { HashHelper } from "../../utils/hash.js";
import type { UserRepository } from "../../repositories/user.repository.js";
import type { VerifyFunction } from "passport-local";

/**
 * 建立 passport-local Strategy
 *
 * 職責：
 * - 驗證 email / password 是否正確
 * - 成功：回傳 user（給 passport）
 * - 失敗：done(null, false)
 *
 * 不做的事：
 * - 不存 session
 * - 不設 cookie
 * - 不回 response
 */

export function createLocalStrategy(userRepo: UserRepository): LocalStrategy {
  /**
   * VerifyFunction 是 @types/passport-local 提供的官方型別
   * 會正確推導：
   * - email: string
   * - password: string
   * - done: (err, user?, info?) => void
   */
  const verify: VerifyFunction = async (
    email: string,
    password: string,
    done
  ) => {
    try {
      // 1️⃣ 查使用者
      const user = await userRepo.findByEmail(email);

      // 帳號不存在 or OAuth 使用者（無密碼）
      if (!user || !user.password)
        return done(null, false, { message: "Invalid credentials" });

      // 2️⃣ 驗證密碼
      const isMatch = await HashHelper.compare(password, user.password);
      if (!isMatch)
        return done(null, false, { message: "Invalid credentials" });

      // 3️⃣ 驗證成功
      // passport 會把 user 掛到 req.user
      return done(null, user);
    } catch (err) {
      // 系統錯誤（DB、exception）
      return done(err);
    }
  };

  /**
   * LocalStrategy 設定
   * usernameField = email（符合你目前 schema）
   */
  return new LocalStrategy(
    {
      usernameField: "email",
      passwordField: "password",
      session: true, // 表示「允許使用 session」（是否真的用由你決定）
    },
    verify
  );
}
