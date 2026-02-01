import { Router } from "express";
import { container } from "../../di/container.js";

const router = Router();

router.post("/login", container.authController.login);
router.post("/logout", container.authController.logout);

export default router;
