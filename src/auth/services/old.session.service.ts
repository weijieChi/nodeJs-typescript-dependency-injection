import { SessionRepository } from "../repositories/old.session.repository.js";
import type { Session } from "../../generated/prisma/client.js";
import type { SessionWithUser } from "../../types/user.js";

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
    /**
     * 取得有效 session
     * - 不存在 / 過期 → null
     * - 有效 → session
     */
    const session = await this.repo.findValid(sessionId);
    if (!session) {
      return null;
    }

    if (session.expiresAt <= new Date()) {
      return null;
    }
    return session;
  }

  async findSessionWithUser(
    sessionId: string,
  ): Promise<SessionWithUser | null> {
    const session = await this.repo.findSessionWithUser(sessionId);
    if (!session) return null;
    return session;
  }

  // 同時驗證 cookies sid 的 session 是否存在，跟是否過期，並回傳結果跟關聯資料
  //   (method) SessionService.getValidSessionWithUser(sessionId: string): Promise<({
  //     user: {
  //         name: string;
  //         email: string;
  //         id: number;
  //         createdAt: Date;
  //         updateAt: Date;
  //     };
  // } & {
  //     id: string;
  //     createdAt: Date;
  //     userId: number;
  //     expiresAt: Date;
  // }) | null>
  async getValidSessionWithUser(sessionId: string) {
    const session = await this.repo.findSessionWithUser(sessionId);
    if (!session) return null;
    if (session.expiresAt <= new Date()) return null;
    this.repo.extend(session.id, session.expiresAt);
    return session;
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
