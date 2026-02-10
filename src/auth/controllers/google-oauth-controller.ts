import type { Request, Response } from "express";
import type { OAuthLoginService } from "../services/oauth-login.service.js";
import { logger } from "../../logger/winston.logger.js";

export class GoogleOAuthController {
  constructor(private readonly oauthLoginService: OAuthLoginService) {}

  /**
   * GET /auth/google
   *
   * 目前責任：
   * - 啟動 OAuth login flow
   *
   * 注意：
   * - 實際產生 Google redirect URL 的邏輯
   *   應該由 OAuthLoginService 提供
   */

  redirectToGoogle = async (_req: Request, res: Response) => {
    const url = this.oauthLoginService.getGoogleAuthorizeUrl();
    res.redirect(url);
  };

  /**
   * GET /auth/google/callback
   *
   * Google redirect 回來的 endpoint
   */
  handleGoogleCallback = async (req: Request, res: Response) => {
    try {
      const code = req.query.code;
      if (typeof code !== "string") {
        // OAuth callback 不完整
        logger.error(
          "google-oauth-controller: callback error, Missing authorization code",
          {
            reqQuery: req.query,
          },
        );
        res.redirect("/oauth/google-oauth-test-error.html");
        return;
      }

      // 跑完整 OAuth login（驗證、建 user、發 token）
      await this.oauthLoginService.loginWithGoogle(code);
      // 成功 → 導向成功頁

      res.redirect("/oauth/google-oauth-test-success.html");
      // res.json(result);
    } catch (err) {
      // next(err);
      logger.error("google-oauth-controller: missing authorization code", {
        err: err,
      });
      res.redirect("/oauth/google-oauth-test-error.html");
    }
  };
}
