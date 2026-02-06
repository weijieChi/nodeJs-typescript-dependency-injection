// ✔ app-level 才知道 Express
// ✔ auth sub-module 完全不知道 router 存在
// ✔ controller 只依賴 use case

import type { PrismaClient } from "../generated/prisma/client.js";
import type { UserRepository } from "../repositories/user.repository.js";
import type { JwtLoginService } from "../auth/jwt/jwt-login.service.js";

import { createGoogleOAuthModule } from "../auth/di/google-oauth.module.js";
import { GoogleOAuthController } from "../auth/controllers/google-oauth-controller.js";
import { createGoogleOAuthRouter } from "../auth/routes/google-oauth.routes.js";

export interface GoogleModuleDependencies {
  prisma: PrismaClient;
  userRepository: UserRepository;
  jwtLoginService: JwtLoginService;
  googleOAuthConfig: {
    clientId: string;
    clientSecret: string;
    redirectUrl: string;
  };
}

export function createGoogleModule(deps: GoogleModuleDependencies) {
  // application / use case
  const { oauthLoginService } = createGoogleOAuthModule({
    prisma: deps.prisma,
    userRepository: deps.userRepository,
    jwtLoginService: deps.jwtLoginService,
    googleOAuthConfig: deps.googleOAuthConfig,
  });

  // adapter
  const controller = new GoogleOAuthController(oauthLoginService);
  const router = createGoogleOAuthRouter(controller);

  return {
    googleOAuthRouter: router,
  };
}
