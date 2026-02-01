import { JwtService } from "../jwt/jwt.service.js";
import { JwtRepository } from "../jwt/jwt.repository.js";
import { JwtLoginService } from "../jwt/jwt-login.service.js";
import { JwtLogoutService } from "../jwt/jwt-logout.service.js";
import { AuthController } from "../controllers/auth.controller.js";
import type { PrismaClient } from "../../generated/prisma/client.js";

export function createAuthModule(
  deps: {
  prisma: PrismaClient;
  jwtSecret: string;
  }
) {
  const jwtService = new JwtService(deps.jwtSecret);
  const jwtRepository = new JwtRepository(deps.prisma);

  const jwtLoginService = new JwtLoginService(
    deps.prisma,
    jwtService,
    jwtRepository,
  );

  const jwtLogoutService = new JwtLogoutService(jwtService, jwtRepository);

  const authController = new AuthController(jwtLoginService, jwtLogoutService);

  return {
    jwtService,
    jwtRepository,
    jwtLoginService,
    jwtLogoutService,
    authController,
  };
}
