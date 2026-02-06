import type { PrismaClient } from "../../generated/prisma/client.js";
import type { UserRepository } from "../../repositories/user.repository.js";
import type { JwtLoginService } from "../jwt/jwt-login.service.js";

import { GoogleOAuthServiceImpl } from "../oauth/google-oauth.service.js";
import { OAuthLoginService } from "../services/oauth-login.service.js";
import { OAuthAccountRepository } from "../repositories/oauth-account.repository.js";

/**
 * 建立 Google OAuth module 所需的依賴
 *
 * ❗ module 本身不讀 process.env
 * ❗ module 不 new PrismaClient
 */

export interface GoogleOAuthModuleDependencies {
  prisma: PrismaClient;
  userRepository: UserRepository;
  jwtLoginService: JwtLoginService;
  googleOAuthConfig: {
    clientId: string;
    clientSecret: string;
    redirectUrl: string;
  };
}

/**
 * Google OAuth DI module
 *
 * 責任：
 * - 組裝 Google OAuth SDK service
 * - 組裝 OAuth login use case
 *
 * 不做：
 * - 不處理 HTTP
 * - 不處理 redirect
 * - 不處理 controller
 */

export function createGoogleOAuthModule(deps: GoogleOAuthModuleDependencies) {
  // Google OAuth SDK wrapper
  const googleOAuthService = new GoogleOAuthServiceImpl(deps.googleOAuthConfig);

  // OAuthAccount repository（Prisma-based）
  const oauthAccountRepository = new OAuthAccountRepository(deps.prisma);

  // OAuth login use case
  const oauthLoginService = new OAuthLoginService(
    googleOAuthService,
    deps.userRepository,
    oauthAccountRepository,
    deps.jwtLoginService,
  );

  return {
    googleOAuthService,
    oauthLoginService,
  };
}
