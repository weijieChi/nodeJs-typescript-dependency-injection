import { createUserModule } from "./user.module.js";
import { prisma } from "../libs/prisma.js";
// 未來還可以加入 postModule、fileModule...
import { createAuthModule } from "../auth/di/jwt-auth.module.js";
import "dotenv/config";

import { createSessionModule } from "../auth/modules/old.session.module.js";

import { createGoogleModule } from "./google.module.js";

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error("JWT_SECRET is not found");
}

const jwtAuthModule = createAuthModule({
  prisma,
  jwtSecret: JWT_SECRET,
});

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
if (!GOOGLE_CLIENT_ID) {
  throw new Error("GOOGLE_CLIENT_ID is not found");
}

const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
if (!GOOGLE_CLIENT_SECRET) {
  throw new Error("GOOGLE_CLIENT_SECRET is not found");
}

const GOOGLE_REDIRECT_URL = process.env.GOOGLE_REDIRECT_URL;
if (!GOOGLE_REDIRECT_URL) {
  throw new Error("GOOGLE_REDIRECT_URL is not found");
}

const userModule = createUserModule(prisma);

const sessionModule = createSessionModule(prisma);

const googleModule = createGoogleModule({
  prisma,
  userRepository: userModule.userRepository,
  jwtLoginService: jwtAuthModule.jwtLoginService,
  googleOAuthConfig: {
    clientId: GOOGLE_CLIENT_ID,
    clientSecret: GOOGLE_CLIENT_SECRET,
    redirectUrl: GOOGLE_REDIRECT_URL,
  },
});

export const container = {
  prisma,
  ...userModule, // 把 createUserModule 改掉不曉得會不會影響到其他引用的套件
  ...sessionModule,
  ...jwtAuthModule,
  ...googleModule,
  // ...createPostModule(),
  // ...createFileModule(),
};
