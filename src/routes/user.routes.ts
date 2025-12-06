import { Router } from "express";
import { container } from "../di/container";

const router = Router();
const userController = container.userController;

router.post("/register", userController.login);
router.post("/login", userController.login);

export default router;