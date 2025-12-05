import bcrypt, { compare } from "bcryptjs";

export class HashHelper {
  static async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 10);
  }
  static async compare(plain: string, hash: string): Promise<boolean> {
    return bcrypt.compare(plain, hash);
  }
}
