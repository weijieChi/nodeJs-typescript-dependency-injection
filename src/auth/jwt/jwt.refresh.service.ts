import { JwtService } from "./jwt.service.js";
import { JwtRepository } from "./jwt.repository.js";
import { AppError } from "../../errors/app-error.js";

export class JwtRefreshService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly jwtRepository: JwtRepository,
  ) {}

  async refresh(refreshToken: string) {
    // 1️⃣ 驗 JWT + parse payload
    const payload = this.jwtService.verifyToken(refreshToken);

    // 2️⃣ 確保這是一顆 refresh token
    if (payload.type !== "REFRESH") {
      throw new AppError("Invalid token type", 401);
    }

    // 3️⃣ 查 DB 是否還有效
    const record = await this.jwtRepository.findValidRefreshToken(payload.jti);

    if (!record) {
      throw new AppError("Refresh token revoked or expired", 401);
    }

    // 4️⃣ 比對 securityStamp（帳號狀態是否改變）
    if (record.securityStamp !== payload.securityStamp) {
      // 這裡通常會觸發「全體失效」
      await this.jwtRepository.revokeAllByUser(record.userId);
      throw new AppError("token invalidated", 401);
    }

    // 5️⃣ rotation：先撤銷舊的
    await this.jwtRepository.revokeByJti(payload.jti);

    // 6️⃣ 簽新的 access
    const accessToken = this.jwtService.signAccessToken(record.userId);

    // 7️⃣ 簽新的 refresh
    const { token: newRefreshToken, payload: newPayload } =
      this.jwtService.signRefreshToken(record.userId, record.securityStamp);

    // 8️⃣ 存新的 refresh
    await this.jwtRepository.createRefreshToken({
      userId: record.userId,
      jti: newPayload.jti,
      securityStamp: newPayload.securityStamp,
      expiresAt: new Date(newPayload.exp * 1000),
    });

    return {
      accessToken,
      refreshToken: newRefreshToken,
    };
  }
}
