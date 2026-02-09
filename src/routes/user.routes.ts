import { Router } from "express";
import { container } from "../di/container.js";
import { asyncHandler } from "../utils/async--handler.js";
import { notFoundHandler } from "../middleware/not-found.js";
import { validate } from "../middleware/validate.js";
import { RegisterSchema } from "../types/auth.js";
import type { Request, Response, NextFunction } from "express";

import { ensureAuth } from "../auth/middleware/ensure-auth.js";

const router = Router();
const userController = container.userController;

/**
 * GET /user/profile
 * 需要登入
 */
router.get(
  "/profile",
  ensureAuth,
  async (req: Request, res: Response, next: NextFunction) => {
    if (!req.user?.id) {
      next(new Error("Unauthenticated user"));
    }
    const id = Number(req.user?.id);
    if (Number.isNaN(id)) {
      next(new Error("Invalid user id"));
    }

    const user = await container.userRepository.findById(id);
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }
    res.json(user);
  },
);

router.post(
  "/register",
  validate(RegisterSchema),
  asyncHandler(userController.register),
);

// 路由最後掛錯誤處理

// ⛔ 404 Handler 應該放在所有 routes 之後
router.use(notFoundHandler);

export default router;
