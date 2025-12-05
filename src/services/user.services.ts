import { IUserRepository } from "../repositories/user.repository.interface";
import { HashHelper } from "../utils/hash";
import { RegisterDTO, LoginDTO } from "../types/user";

export class UserService {
  constructor(private userRepository: IUserRepository) {}

  async register(data: RegisterDTO) {
    const exists = await this.userRepository.findByUsername(data.username);
    if (exists) throw new Error("Username already exists");

    const hashed = await HashHelper.hashPassword(data.password);
    return this.userRepository.createUser({
      username: data.username,
      password: data.password,
    });
  }

  async login(data: LoginDTO) {
    const user = await this.userRepository.findByUsername(data.username);
    if (!user) throw new Error("User not found!");

    const match = await HashHelper.compare(data.password, user.password);
    if (!match) throw new Error("Invalid password!");

    return user;
  }
}
