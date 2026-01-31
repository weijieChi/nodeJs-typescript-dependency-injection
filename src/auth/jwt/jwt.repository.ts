import type { JwtToken, PrismaClient } from "../../generated/prisma/client.js";

export class JwtRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async createRefreshToken(params: {
    userId: number;
    jti: string;
    securityStamp: string;
    expiresAt: Date;
  }) {
    return this.prisma.jwtToken.create({
      data: {
        userId: params.userId,
        jti: params.jti,
        type: "REFRESH",
        securityStamp: params.securityStamp,
        expiresAt: params.expiresAt,
      },
    });
  }

  async findValidRefreshToken(jti: string): Promise<JwtToken | null> {
    return this.prisma.jwtToken.findFirst({
      where: {
        jti,
        type: "REFRESH",
        revoked: false,
        expiresAt: {
          gt: new Date()
        },
      },
    });
  }

  async revokeByJti(jti: string) {
    return this.prisma.jwtToken.updateMany({
      where: { jti },
      data: { revoked: true },
    });
  }

  async revokeAllByUser(userId: number) {
    return this.prisma.jwtToken.updateMany({
      where: {
        userId,
        type: "REFRESH",
        revoked: false,
      },
      data: { revoked: true }
    })
  }
}
