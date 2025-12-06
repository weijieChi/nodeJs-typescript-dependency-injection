import type { User } from "../models/user.model"

export interface IUserRepository {
  createUser(user: Omit<User, "id">): Promise<User>;
  findByUsername(username: string): Promise<User | null>;
}

/*
Omit<User, "id">:
忽視或刪除 User type 的 id 的 key 值，如果沒有在 User type 定義 id 則沒有作用
*/