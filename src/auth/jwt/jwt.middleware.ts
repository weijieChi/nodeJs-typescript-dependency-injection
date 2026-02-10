import { JwtService } from "./jwt.service.js";
import { AppError } from "../../errors/app-error.js";
import type { Request, Response, NextFunction } from "express";

export function jwtAuth(jwtService: JwtService) {
  return (req: Request, _res: Response, next: NextFunction) => {
    // 1️⃣ 取 Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return next(new AppError("Unauthorized", 401));
    }

    // 2️⃣ Bearer <token>
    const [schema, token] = authHeader.split(" ");
    if (schema !== "Bearer" || !token) {
      return next(new AppError("Unauthorized", 401));
    }

    try {
      // 3️⃣ verify JWT
      const payload = jwtService.verifyToken(token);

      // 4️⃣ 只接受 ACCESS token
      if (payload.type !== "ACCESS") {
        throw new AppError("Unauthorized", 401);
      }

      // 5️⃣ attach user（符合既有 express.d.ts）
      // as Express.User 不是在「假裝資料存在」，
      // 「我知道這裡只是一個 identity view，而不是完整 user。」
      const user = { id: payload.sub } as Express.User; // 告訴 TS：先不要管其他欄位
      req.user = user;
      return next();
    } catch (err) {
      return next(err);
    }
  };
}
