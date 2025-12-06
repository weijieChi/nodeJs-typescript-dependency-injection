import express from "express";
import userRoutes from "./routes/user.routes";

export const app = express();
app.use(express.json());
app.get("/", (req, res) => {
  res.json({ message: "server is running." })
})
app.use("/user", userRoutes);