import { Router } from "express";
import { container } from "../di/container.js";
import { asyncHandler } from "../utils/async--handler.js";
import { notFoundHandler } from "../middleware/not-found.js";
import { validate } from "../middleware/validate.js";
import { RegisterSchema, LoginSchema } from "../types/user.js";

const router = Router();
const userController = container.userController;

router.post("/register",
  validate(RegisterSchema),
  asyncHandler(userController.register));
router.post("/login",
  validate(LoginSchema),
  asyncHandler(userController.login));

// 路由最後掛錯誤處理

// ⛔ 404 Handler 應該放在所有 routes 之後
router.use(notFoundHandler);

export default router;