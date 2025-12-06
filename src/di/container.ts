import { createUserModule } from "./user.module.js";
// 未來還可以加入 postModule、fileModule...
// import { createPostModule } from "./post.module.js";

export const container = {
  ...createUserModule(),
  // ...createPostModule(),
  // ...createFileModule(),
};