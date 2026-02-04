// Service interface（可測試、可替換）

import type { GoogleUserInfo } from "./google-oauth.types.js";
import type { TokenPayload } from "google-auth-library";
import { OAuth2Client } from "google-auth-library";
import { AppError } from "../../errors/app-error.js";

export interface GoogleOAuthService {
  generateAuthUrl(state: string): string;
  getUserInfoFromCode(code: string): Promise<GoogleUserInfo>;
}

// 這個 interface 本身已經說清楚一切：
// state 是由外部產生（不是 service 自己決定）
// callback 只關心 code
// 回傳的是「乾淨 domain-friendly 資料」

// -------------------

/**
 * 建立 GoogleOAuthService 所需的設定
 * ❌ 不在 service 內讀 process.env
 */
export interface GoogleOAuthConfig {
  clientId: string;
  clientSecret: string;
  redirectUrl: string;
}

/**
 * Google OAuth SDK 封裝
 *
 * 責任：
 * - 產生 Google 授權 URL
 * - 用 authorization code 換取 Google user info
 *
 * 不做：
 * - 不查 DB
 * - 不建立 User
 * - 不發 JWT
 */
export class GoogleOAuthServiceImpl {
  private readonly client: OAuth2Client;

  constructor(private readonly config: GoogleOAuthConfig) {
    this.client = new OAuth2Client({
      clientId: config.clientId,
      clientSecret: config.clientSecret,
      redirectUri: config.redirectUrl,
    });
  }

  /**
   * 產生 Google OAuth 登入頁 URL
   * 由 router 負責 redirect 使用者
   */
  generateAuthUrl(state: string): string {
    return this.client.generateAuthUrl({
      access_type: "offline", // 為了 refresh token
      scope: ["openid", "email", "profile"],
      state,
      prompt: "consent", // 確保能拿到 refresh token（測試期建議）
    });
  }

  /**
   * OAuth callback：
   * 用 Google 回傳的 authorization code
   * 換取並驗證 Google 使用者資訊
   */
  async getUserInfoFromCode(code: string): Promise<GoogleUserInfo> {
    // 1. 用 code 換 token
    const { tokens } = await this.client.getToken(code);
    if (!tokens.id_token) {
      throw new AppError("Google OAuth: missing id_token", 400);
    }

    // 2. 驗證並解析 id_token
    const ticket = await this.client.verifyIdToken({
      idToken: tokens.id_token,
      audience: this.config.clientId,
    });

    const payload = ticket.getPayload();
    if (!payload) {
      throw new AppError("Google OAuth: invalid token payload", 400);
    }

    // 3️⃣ 轉換成我們自己的 domain-friendly 結構
    return this.mapPayloadToUserInfo(payload);
  }

  /**
   * 將 Google TokenPayload 映射為系統內使用的 GoogleUserInfo
   */
  private mapPayloadToUserInfo(payload: TokenPayload): GoogleUserInfo {
    if (!payload.sub || !payload.email) {
      throw new AppError("Google OAuth error: miss required user info", 400);
    }

    return {
      provider: "GOOGLE",
      providerUserId: payload.sub,
      email: payload.email,
      emailVerified: payload.email_verified ?? false,
      ...(payload.name ? { name: payload.name } : {}),
      ...(payload.picture ? { picture: payload.picture } : {}),
    };
  }
}
