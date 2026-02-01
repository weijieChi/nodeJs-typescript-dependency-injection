import { createUserModule } from "./user.module.js";
import { prisma } from "../libs/prisma.js";
// 未來還可以加入 postModule、fileModule...
// import { createPostModule } from "./post.module.js";
import { createAuthModule } from "../auth/di/auth.module.js";
import "dotenv/config";

import { createSessionModule } from "../auth/modules/session.module.js";

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error("JWT_SECRET is not found");
}

const authModule = createAuthModule({
  prisma,
  jwtSecret: JWT_SECRET,
});

export const container = {
  prisma,
  ...createUserModule(prisma),
  ...createSessionModule(prisma),
  ...authModule,
  // ...createPostModule(),
  // ...createFileModule(),
};
