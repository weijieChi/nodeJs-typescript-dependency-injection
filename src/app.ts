import express from "express";
import session from "express-session";
import passport from "passport";
import cookieParser from "cookie-parser";
import pgSession from "connect-pg-simple";
import "dotenv/config";
// import { initLocalStrategy } from "./auth/strategies/local.strategy.init.js"; // 舊的手寫 session
import { pool } from "./libs/pg.js";
import { httpLogger } from "./logger/morgan.middleware.js";
import { generalErrorHandler } from "./middleware/error-handler.js";

// router
import userRoutes from "./routes/user.routes.js";
import authRouter from "./auth/routes/auth.routes.js";
// import createGoogleOAuthRouter from "./auth/routes/google-oauth.routes.js"
import { container } from "./di/container.js";

// ✅ 1️⃣ 只要 import，就會執行 serialize / deserialize
import "./auth/strategies/strategies.index.js";

export const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 1️⃣ body / cookie middleware
app.use(cookieParser());

const PgSessionStore = pgSession(session);

// 型別乾淨
// 未來如果開更嚴格的 TS 不會爆
// 這是你前面「fail fast config」理念的延伸
const SESSION_SECRET = process.env.SESSION_SECRET; // TS 會自動推斷為 string 型別
if (!SESSION_SECRET) {
  throw new Error("SESSION_SECRET is not defined");
}

// express-session（一定要在 passport 前）
app.use(
  session({
    name: "sid", // cookie 名稱，可自訂
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: false,

    store: new PgSessionStore({
      pool,
      tableName: "express_sessions",
    }),

    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 1000 * 60 * 60, // 1 hour
    },

    rolling: true, // 🔑 對應 sliding expiration（cookie 層）
  }),
);

/* ---------------- passport ---------------- */

app.use(passport.initialize()); // passport initialize
app.use(passport.session()); // passport session（serialize / deserialize）

app.use(express.static("public"));

/* ---------------- routes ---------------- */
app.use(httpLogger); // httpLogger
// initLocalStrategy(); // 舊的手寫的
app.use("/user", userRoutes);
app.use("/auth", authRouter);
app.use("/auth", container.googleOAuthRouter);
app.get("/", (req, res) => {
  res.json({ message: "server is running." });
});
app.use(generalErrorHandler);
