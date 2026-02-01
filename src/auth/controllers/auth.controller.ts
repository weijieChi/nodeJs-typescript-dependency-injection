// 你現在的 controller 已經需要依賴多個 service（JWT / session），
// function-based 反而會開始痛苦。

// 要決定 authStrategy（jwt / session）
// 要注入 JwtLoginService
// 要注入 JwtLogoutService
// 還要跟 passport 的 login / logout 共存

// 代表 controller 本身需要「被組裝」

// class-based controller 在你現在的架構下的好處
// 1️⃣ 自然支援 DI（你已經在用）
// 2️⃣ login / logout 邏輯會變得很乾淨
// login = async (req, res, next) => { ... }
// logout = async (req, res, next) => { ... }
// 不用再想「這個 service 是哪來的」。

// 3️⃣ 對未來 OAuth 非常友善（但你不用現在就做）
// constructor(
//   jwtLoginService,
//   jwtLogoutService,
//   googleOAuthService,
// ) {}

// function-based 適合：
// controller 完全無依賴
// 或只依賴一個 singleton
// CRUD 型 API

// 之前 passport controller
// 只有 passport local
// passport 本身是 global singleton
// controller 沒有真正的 dependency
// 所以 function-based 是合理的。
// -----------------------------

import type { Request, Response, NextFunction } from "express";
import { AppError } from "../../errors/app-error.js";
import { JwtLoginService } from "../jwt/jwt-login.service.js";
import { JwtLogoutService } from "../jwt/jwt-logout.service.js";
import { LoginSchema } from "../../types/auth.js";
import * as sessionController from "./auth.session.controller.js";
// import { logger } from "../../logger/winston.logger.js";

export class AuthController {
  constructor(
    private readonly jwtLoginService: JwtLoginService,
    private readonly jwtLogoutService: JwtLogoutService,
  ) {}

  // POST /auth/login
  login = async (req: Request, res: Response, next: NextFunction) => {
    const parsed = LoginSchema.safeParse(req.body);

    if (!parsed.success) {
      throw new AppError("Invalid login payload", 400, {
        zodError: parsed.error.issues,
      });
    }

    const { authStrategy } = parsed.data;
    // if (!authStrategy) {
    //   throw new AppError("authStrategy is required", 400);
    // }

    switch (authStrategy) {
      case "jwt": {
        const result = await this.jwtLoginService.login(
          parsed.data.email,
          parsed.data.password,
        );
        return res.status(200).json(result);
      }
      case "session": {
        return sessionController.login(req, res, next);
      }
      default: {
        throw new AppError("Unsupported auth strategy", 400);
      }
    }
  };

  // POST /auth/logout
  logout = async (req: Request, res: Response, next: NextFunction) => {
    try {
      // JWT logout（單一裝置）
      if (req.headers.authorization) {
        const refreshToken = req.body?.refreshToken;
        if (!refreshToken) {
          throw new AppError("Refresh token required", 400);
        }
        const authHeader = req.headers.authorization;
        if (authHeader?.startsWith("Bearer ")) {
          throw new AppError("authHeader required jwt type")
        }

        await this.jwtLogoutService.logout(refreshToken);
        return res.status(204).end();
      }

      // Session logout（passport）
      req.logout((err) => {
        if (err) {
          return next(err);
        }
        req.session?.destroy(() => {
          return res.status(204).end();
        });
      });
    } catch (err) {
      next(err);
    }
  };
}
