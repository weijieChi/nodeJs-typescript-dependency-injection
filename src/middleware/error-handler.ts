import type { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";
import { Prisma } from "../generated/prisma/client.js";
import { AppError } from "../errors/app-error.js";

export const generalErrorHandler = (
  err: unknown,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction
) => {
  console.error("[ERROR]", err);

  // 1. Zod 驗證錯誤
  if (err instanceof ZodError) {
    return res.status(400).json({
      status: "fail",
      errors: err.flatten(),
    });
  }
  // Prisma.PrismaClientUnknownRequestError
  // 2. Prisma 錯誤 （例如 unique constraint）
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    // err: Prisma.PrismaClientUnknownRequestError;
    return res.status(400).json({
      status: "error",
      code: err.code,
      message: err.meta?.target
        ? `${err.meta.target} already exists`
        : err.message,
    });
  }

  // 3. 自訂 AppError
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      status: "error",
      message: err.message,
    });
  }

  // 4. 一般 Error
  if (err instanceof Error) {
    return res.status(500).json({
      status: "error",
      message: err.message,
    });
  }

  // 5. 其他未知錯誤
  return res.status(500).json({
    status: "error",
    message: "Unknown server error",
  });
};
