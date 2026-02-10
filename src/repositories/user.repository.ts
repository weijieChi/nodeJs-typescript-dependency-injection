import {
  type PrismaClient,
  type User,
  Prisma,
} from "../generated/prisma/client.js";
import type { IUserRepository } from "./user.repository.interface.js";
import type { SafeUser } from "../types/express.js";

export class UserRepository implements IUserRepository {
  constructor(private prisma: PrismaClient) {}

  async createUser(data: Prisma.UserCreateInput): Promise<User> {
    return this.prisma.user.create({
      data,
    });
  }

  async searchByName(name: string): Promise<User[] | null> {
    // return this.user.find(u => u.username === username) ?? null;
    // ?? null 的意思是：
    // 如果左邊是 undefined 或 null → 回傳 null，否則回傳左邊值。
    // 不會處理 0 跟 '' 空字串

    const users = this.prisma.user.findMany({
      where: { name },
    });
    if ((await users).length === 0) {
      return null;
    } else {
      return users;
    }
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  async findById(id: number): Promise<SafeUser | null> {
    return this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        securityStamp: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }
}
