import { UserRepository } from "../repositories/user.repository.js";
import { UserService } from "../services/user.services.js";
import { UserController } from "../controllers/user.controller.js";

export const createUserModule = () => {
  const userRepository = new UserRepository();
  const userService = new UserService(userRepository);
  const userController = new UserController(userService);

  return {
    userRepository,
    userService,
    userController,
  };
};
