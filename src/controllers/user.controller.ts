import { UserService } from "../services/user.services.js";
import type { Request, Response } from "express";

export class UserController {
  constructor(private userServices: UserService) {}

  register = async (req: Request, res: Response) => {
    try {
      const user = await this.userServices.register(req.body);
      res.json({ message: "Registered", user });
    } catch (err: unknown) {
      if (err instanceof Error) res.status(400).json({ error: err.message });
      return res.status(400).json({ error: "Unknown error" });
    }
  };

  login = async (req: Request, res: Response) => {
    try {
      const user = await this.userServices.login(req.body);
      res.json({ message: "Login success!", user });
    } catch (err: unknown) {
      if (err instanceof Error) res.status(400).json({ error: err.message });
      return res.status(400).json({ error: "Unknown error" });
    }
  };
}
