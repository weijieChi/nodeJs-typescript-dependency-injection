// Controller 改成 asyncHandler（不用 try/catch）

import { UserService } from "../services/user.services.js";
import type { Request, Response } from "express";
import type { RegisterDTO, LoginDTO } from "../types/user.js";

export class UserController {
  constructor(private userServices: UserService) {}

  register = async (
    req: Request<unknown, unknown, RegisterDTO>,
    res: Response
  ) => {
    // try {
    //   // const { name, email, password } = req.body;
    //   const user = await this.userServices.register(req.body);
    //   res.json({ message: "Registered", user });
    // } catch (err: unknown) {
    //   if (err instanceof Error) res.status(400).json({ error: err.message });
    //   return res.status(400).json({ error: "Unknown error" });
    // }
    const user = await this.userServices.register(req.body);
    const { password: _password, ...safeUser } = user;
    res.json({
      message: "Registered success!",
      safeUser,
    });
  };

  login = async (req: Request<unknown, unknown, LoginDTO>, res: Response) => {
    // try {
    //   const user = await this.userServices.login(req.body);
    //   res.json({ message: "Login success!", user });
    // } catch (err: unknown) {
    //   if (err instanceof Error) res.status(400).json({ error: err.message });
    //   return res.status(400).json({ error: "Unknown error" });
    // }
    const user = await this.userServices.login(req.body);
    const { password: _password, ...safeUser } = user;
    res.json({
      message: "Login success!",
      safeUser,
    });
  };
}
