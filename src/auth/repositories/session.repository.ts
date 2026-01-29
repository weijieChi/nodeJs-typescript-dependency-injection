import type { PrismaClient, Session } from "../../generated/prisma/client.js";
import type { SessionWithUser } from "../../types/user.js"

export class SessionRepository {
  constructor(private prisma: PrismaClient) {}

  /**
   * 建立 session
   */
  async create(userId: number, expiresAt: Date): Promise<Session> {
    return this.prisma.session.create({
      data: { userId, expiresAt },
    });
  }

  /**
   * 延長 session 有效期限
   */
  async extend(sessionId: string, expiresAt: Date): Promise<void> {
    await this.prisma.session.update({
      where: { id: sessionId },
      data: { expiresAt },
    });
  }

  /**
   * 刪除 session（登出）
   */
  async delete(sessionId: string): Promise<void> {
    await this.prisma.session.delete({ where: { id: sessionId } });
  }

  /**
   * 找有效 session（存在且未過期）
   */
  async findValid(sessionId: string) {
    const now = new Date();
    return this.prisma.session.findFirst({
      where: {
        id: sessionId,
        expiresAt: { gt: now },
      },
    });
  }

   /**
   * 依 sessionId 查詢 session，並關聯 user
   */
  async findSessionWithUser(
    sessionId: string
  ): Promise<SessionWithUser | null> {
    return this.prisma.session.findUnique({
      where: { id: sessionId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            createdAt: true,
            updatedAt: true,
          }
        }
      }
    })
  }

  /**
   * （選用）清理過期 session
   */
  async deleteExpired(now: Date = new Date()): Promise<number> {
    const result = await this.prisma.session.deleteMany({
      where: {
        expiresAt: { lte: now },
      },
    });
    return result.count;
  }
}
