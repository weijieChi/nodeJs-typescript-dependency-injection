import type { Session } from "../../generated/prisma/client.js";
import { SessionRepository } from "../repositories/session.repository.js";

const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 7; // 7 天
const EXTEND_THRESHOLD_MS = 1000 * 60 * 60 * 24; // 剩 1 天才延

export class SessionService {
  constructor(private readonly repo: SessionRepository) {}

  /**
   * 建立 session（登入成功後）
   */
  async createSession(userId: number): Promise<Session> {
    const expiresAt = new Date(Date.now() + SESSION_TTL_MS);
    return this.repo.create(userId, expiresAt);
  }

  /**
   * 驗證 session 是否有效
   * - 不存在 / 過期 → null
   * - 有效 → 回傳 session
   */
  async validateSession(sessionId: string): Promise<Session | null> {
    return this.repo.findValid(sessionId);
  }

  /**
   * Sliding session：
   * 剩餘時間太短才延長
   */
  async extendIfNeeded(session: Session): Promise<void> {
    const remainingMs = session.expiresAt.getTime() - Date.now();

    if (remainingMs > EXTEND_THRESHOLD_MS) {
      return;
    }

    const newExpiresAt = new Date(Date.now() + SESSION_TTL_MS);
    await this.repo.extend(session.id, newExpiresAt);
  }

  /**
   * 登出
   */
  async revokeSession(sessionId: string): Promise<void> {
    await this.repo.delete(sessionId);
  }
}
