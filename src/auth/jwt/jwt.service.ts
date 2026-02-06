// 組 payload
// 簽 token
// 驗 token

import jwt from "jsonwebtoken";
import { v7 as uuidv7 } from "uuid";
// import { logger } from "../../logger/winston.logger.js";

import {
  JwtPayloadSchema,
  type JwtPayload,
  type AccessTokenPayload,
  type RefreshTokenPayload,
} from "./jwt.types.js";

import { JWT_CONSTANTS } from "./jwt.constants.js";

export class JwtService {
  constructor(private readonly secret: string) {}
  // ⚠️ secret 從外面傳進來（DI-friendly）
  signAccessToken(userId: number): string {
    const now = Math.floor(Date.now() / 1000);

    const payload: AccessTokenPayload = {
      sub: userId,
      type: "ACCESS",
      iat: now,
      exp: now + JWT_CONSTANTS.ACCESS_TOKEN_TTL_SEC,
    };

    return jwt.sign(payload, this.secret);
  }

  // 這一步只負責「簽」，不負責「存 DB」。
  signRefreshToken(
    userId: number,
    securityStamp: string,
  ): { token: string; payload: RefreshTokenPayload } {
    const now = Math.floor(Date.now() / 1000);

    const payload: RefreshTokenPayload = {
      sub: userId,
      jti: uuidv7(), // 之後你會換成 uuid v7
      type: "REFRESH",
      securityStamp,
      iat: now,
      exp: now + JWT_CONSTANTS.REFRESH_TOKEN_TTL_SEC,
    };

    const token = jwt.sign(payload, this.secret);

    return {token, payload};
  }

  verifyToken(token:string): JwtPayload {
    const decoded = jwt.verify(token, this.secret);
    return JwtPayloadSchema.parse(decoded);
  }
}
