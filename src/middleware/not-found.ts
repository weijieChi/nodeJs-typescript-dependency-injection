import type { Request, Response, NextFunction } from "express";
import { AppError } from "../errors/app-error.js";

export const notFoundHandler = (req: Request, res: Response, next: NextFunction) => {
  next(new AppError(`Route ${req.originalUrl} not found`, 404));
  // res.status(404).json({
  //   status: "error",
  //   message: `Route ${req.originalUrl} not found`,
  // });
};
