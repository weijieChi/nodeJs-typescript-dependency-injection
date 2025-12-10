import type { PrismaClient, User, Prisma } from "../generated/prisma/client.js";
import type { IUserRepository } from "./user.repository.interface.js";

export class UserRepository implements IUserRepository {
  constructor(private prisma: PrismaClient) {}

  async createUser(data: Prisma.UserCreateInput): Promise<User> {
    return this.prisma.user.create({
      data,
    });
  }

  async findByUsername(name: string): Promise<User | null> {
    // return this.user.find(u => u.username === username) ?? null;
    // ?? null 的意思是：
    // 如果左邊是 undefined 或 null → 回傳 null，否則回傳左邊值。
    // 不會處理 0 跟 '' 空字串

    return this.prisma.user.findUnique({
      where: { name },
    });
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }
}
