import type { PrismaClient } from "../../generated/prisma/client.js";
import type { OAuthProvider } from "../../generated/prisma/client.js";

/**
 * OAuthAccount Repository
 *
 * 責任：
 * - 封裝 OAuthAccount 的 DB 存取
 *
 * 不做：
 * - 不處理 OAuth 流程
 * - 不處理 User 建立
 * - 不處理 JWT
 */
export class OAuthAccountRepository {
  constructor(private readonly prisma: PrismaClient) {}

  /**
   * 依 provider + providerUserId 查詢 OAuthAccount
   */
  findByProviderUserId(provider: OAuthProvider, providerUserId: string) {
    return this.prisma.oAuthAccount.findUnique({
      where: {
        provider_providerUserId: {
          provider,
          providerUserId,
        },
      },
    });
  }

  /**
   * 建立 OAuthAccount
   *
   * ⚠️ 呼叫前請確保：
   * - user 已存在
   * - provider + providerUserId 尚未存在
   */
  create(data: {
    provider: OAuthProvider;
    providerUserId: string;
    userId: number;
  }) {
    return this.prisma.oAuthAccount.create({
      data,
    });
  }

  async findOrCreate(data: {
    provider: OAuthProvider;
    providerUserId: string;
    userId: number;
  }) {
    const existing = await this.findByProviderUserId(
      data.provider,
      data.providerUserId,
    );

    if (existing) {
      return existing;
    }

    return this.create(data);
  }
}
