import passport from "passport";
import { container } from "../../di/container.js";
import { createLocalStrategy } from "./local.strategy.js";

// local
passport.use(
  "local",
  createLocalStrategy(container.userRepository)
)

// 之後你會加：
// import "./jwt.strategy.js"
// import "./oauth.google.strategy.js"