// ✔ app-level 才知道 Express
// ✔ auth sub-module 完全不知道 router 存在
// ✔ controller 只依賴 use case


import { Router } from "express";
import type { GoogleOAuthController } from "../controllers/google-oauth-controller.js";

export function createGoogleOAuthRouter(controller: GoogleOAuthController) {
  const router = Router();

  router.get("/google/callback", controller.handleGoogleCallback);
  router.get("/google", controller.redirectToGoogle);

  return router;
}
