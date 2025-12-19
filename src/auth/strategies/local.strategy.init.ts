import passport from "passport";
import { createLocalStrategy } from "./local.strategy.js";
import { container } from "../../di/container.js";

export function initLocalStrategy() {
  passport.use("local", createLocalStrategy(container.userRepository));
}