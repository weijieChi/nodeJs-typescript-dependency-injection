import { Router } from "express";
import { container } from "../di/container.js";

const router = Router();
const userController = container.userController;

router.post("/register", userController.register);
router.post("/login", userController.login);

export default router;