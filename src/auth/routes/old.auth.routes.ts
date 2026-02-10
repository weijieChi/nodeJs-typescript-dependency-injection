// @ts-nocheck
/**
 * @deprecated
 * Legacy implementation kept for reference only.
 * Not used by current routing.
 */

import { Router } from "express";
import * as authController from "../controllers/auth.controller.js";

const router = Router();

router.post("/login", authController.login);
router.post("/logout", authController.logout);

export default router;
