import { AppError } from "../../errors/app-error.js";
import { JwtService } from "./jwt.service.js";
import { JwtRepository } from "./jwt.repository.js";

export class JwtLogoutService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly jwtRepository: JwtRepository,
  ) {}

  async logout(refreshToken: string) {
    const payload = this.jwtService.verifyToken(refreshToken);
    if (payload.type !== "REFRESH") {
      throw new AppError("Invalid token", 401);
    }

    // 但我不建議你現在加，因為：
    // logout 本來就是 best-effort
    // client 重送 logout 不該爆炸
    // const result = await this.jwtRepository.revokeByJti(payload.jti);
    // if (result.count === 0) {
    //   throw new AppError("Token already revoked", 401);
    // }

    await this.jwtRepository.revokeByJti(payload.jti);
  }
}
