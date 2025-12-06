import type { IUserRepository } from "./user.repository.interface";
import type { User } from "../models/user.model";

export class UserRepository implements IUserRepository {
  private user: User[] = [];
  private id = 1;

  async createUser(user: Omit<User, "id">): Promise<User> {
    const newUser: User = { id: this.id++, ...user };
    this.user.push(newUser);
    return newUser;
  }

  async findByUsername(username: string): Promise<User | null> {
    return this.user.find(u => u.username === username) ?? null;
    // ?? null 的意思是：
    // 如果左邊是 undefined 或 null → 回傳 null，否則回傳左邊值。
    // 不會處理 0 跟 '' 空字串
  }
}