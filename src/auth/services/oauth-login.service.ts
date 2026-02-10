import { AppError } from "../../errors/app-error.js";
import crypto from "node:crypto";

import type { GoogleOAuthService } from "../oauth/google-oauth.service.js";
import type { GoogleUserInfo } from "../oauth/google-oauth.types.js";
import type { UserRepository } from "../../repositories/user.repository.js";

import { OAuthAccountRepository } from "../repositories/oauth-account.repository.js";

import type { JwtLoginService } from "../jwt/jwt-login.service.js";
import type { User } from "../../generated/prisma/client.js";

/**
 * OAuth login 成功後的回傳結果
 *（JWT login 與 OAuth login 對齊）
 */
export interface OAuthLoginResult {
  accessToken: string;
  refreshToken: string;
}

/**
 * OAuthLoginService
 *
 *  Application / Domain 層 use case：
 * - 編排 OAuth login 流程
 * - 不處理 HTTP / redirect
 * - 不處理 Google SDK 細節
 * - 不直接操作 Prisma
 */
export class OAuthLoginService {
  constructor(
    private readonly googleOAuthService: GoogleOAuthService,
    private readonly userRepository: UserRepository,
    private readonly oauthAccountRepository: OAuthAccountRepository,
    private readonly jwtLoginService: JwtLoginService,
  ) {}

  /**
   * 啟動 Google OAuth login flow
   *
   * Application-level API：
   * - controller 不需要知道 Google SDK
   */
  getGoogleAuthorizeUrl(): string {
    // OAuth 本來就建議要有 state
    // 「目前為了簡化流程，
    // OAuth state 僅用於滿足 OAuth 規範，
    // 未做額外驗證，未來可擴充為 session-based state。」
    const state = crypto.randomUUID();
    return this.googleOAuthService.generateAuthUrl(state);
  }

  /**
   * Google OAuth login
   *
   * @param code authorization code from Google callback
   * 流程：
   * 1. 用 authorization code 向 Google 取得並驗證使用者資訊
   * 2. 依 email 找或建立 User
   * 3. 建立 / 確認 OAuthAccount 關聯
   * 4. 發 JWT（沿用既有 JWT login 邏輯）
   */
  async loginWithGoogle(code: string): Promise<OAuthLoginResult> {
    // 1️⃣ 向 Google 取得使用者資訊（id_token 已驗證）
    // 若 code 無效或 token 驗證失敗，會在此 throw
    const googleUser = await this.googleOAuthService.getUserInfoFromCode(code);

    // 2️⃣ 基本安全檢查
    // 本專案假設 OAuth 使用者一定有 email
    //（個人作品集 scope，不處理無 email 帳號）
    if (!googleUser.email) {
      throw new AppError("Google account email not verified", 400);
    }

    // 3️⃣ 依 email 找或建立 User
    // private helpers
    const user = await this.findOrCreateUser(googleUser);

    // 4️⃣ 建立或確認 OAuthAccount
    // 若已存在，findOrCreate 會直接回傳
    await this.oauthAccountRepository.findOrCreate({
      provider: "GOOGLE",
      providerUserId: googleUser.providerUserId,
      userId: user.id,
    });

    // 5️⃣ 發 JWT（完全沿用既有邏輯）， access token, refresh token
    return this.jwtLoginService.loginWithUser(user);
  }

  // --------------------------------------------------
  // private helpers
  // --------------------------------------------------

  /**
   * 依 Google user info 找或建立系統內 User
   *
   * 規則：
   * - email 為主要識別
   * - OAuth 使用者 password 為 null
   * - name 使用 Google profile name，
   *   若不存在則 fallback 為 email local-part
   */
  private async findOrCreateUser(googleUser: GoogleUserInfo): Promise<User> {
    const existingUser = await this.userRepository.findByEmail(
      googleUser.email,
    );
    if (existingUser) {
      return existingUser;
    }

    const name =
      googleUser.name?.trim() ??
      googleUser.email.split("@")[0] ??
      "google-user"; // typescript 強制要求檢查是否為空直

    return this.userRepository.createUser({
      name,
      email: googleUser.email,
      password: null, // OAuth user
    });
  }
}
