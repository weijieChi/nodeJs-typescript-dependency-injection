// Service 層丟 AppError

import type { IUserRepository } from "../repositories/user.repository.interface.ts";
import type { RegisterDTO, LoginDTO } from "../types/auth.js";
import type { User } from "../generated/prisma/client.js";
import { HashHelper } from "../utils/hash.js";
import { AppError } from "../errors/app-error.js";

export class UserService {
  constructor(private userRepository: IUserRepository) {}

  async register(data: RegisterDTO): Promise<User> {
    // const userExists = await this.userRepository.findByUsername(data.name);
    const emailExist = await this.userRepository.findByEmail(data.email);
    // if (userExists) throw new AppError("Username already exists!", 409);
    if (emailExist) throw new AppError("Email already exists!", 409);

    const hashed = await HashHelper.hashPassword(data.password);
    return this.userRepository.createUser({
      name: data.name,
      email: data.email,
      password: hashed,
    });
  }

  async login(data: LoginDTO): Promise<User> {
    if (!data) {
      throw new AppError("user.services.ts login data not found");
    }
    const user = await this.userRepository.findByEmail(data.email);
    if (!user) throw new AppError("User not found!", 404);

    if (!user.password) {
      throw new AppError("user.services.ts login user.password not found");
    }
    const match = await HashHelper.compare(data.password, user.password);
    if (!match) throw new AppError("Invalid password!", 401);

    return user;
  }
}
