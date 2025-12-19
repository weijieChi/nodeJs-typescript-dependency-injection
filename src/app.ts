import express from "express";
import userRoutes from "./routes/user.routes.js";
import authRouter from "./auth/routes/auth.routes.js";
import { generalErrorHandler } from "./middleware/error-handler.js";
import { httpLogger } from "./logger/morgan.middleware.js";
import { initLocalStrategy } from "./auth/strategies/local.strategy.init.js";
import passport from "passport";

export const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(httpLogger); // httpLogger
app.use(passport.initialize());
initLocalStrategy();
app.use("/user", userRoutes);
app.use("/auth", authRouter);
app.get("/", (req, res) => {
  res.json({ message: "server is running." });
});
app.use(generalErrorHandler);
