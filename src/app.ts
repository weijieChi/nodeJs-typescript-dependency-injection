import express from "express";
import userRoutes from "./routes/user.routes.js";
import { generalErrorHandler } from "./middleware/error-handler.js";
import { httpLogger } from "./logger/morgan.middleware.js";

export const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(httpLogger); // httpLogger
app.get("/", (req, res) => {
  res.json({ message: "server is running." })
})
app.use("/user", userRoutes);
app.use(generalErrorHandler);