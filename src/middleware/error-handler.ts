import type { Request, Response, NextFunction } from "express";
import { ZodError, z } from "zod";
import { Prisma } from "../generated/prisma/client.js";
import { AppError } from "../errors/app-error.js";
import { logger } from "../logger/index.js";

export const generalErrorHandler = (
  err: unknown,
  req: Request,
  res: Response,
  _next: NextFunction
) => {

  // ================================
  // ⭐ 統一記錄 Error Log（Winston）
  // ================================
  logger.error("API Error", {
    method: req.method,
    url: req.originalUrl,
    ip: req.ip,
    body: req.body,
    query: req.query,
   ge : String(err),
    stack: err instanceof Error ? err.stack : undefined,
  });

  // ================================
  // 1️⃣ Zod 驗證錯誤
  // ================================
  // 1. Zod 驗證錯誤
  if (err instanceof ZodError) {
    return res.status(400).json({
      status: "fail",
      errors: z.treeifyError(err), // ⭐ 新作法
    });
  }

  // ================================
  // 2️⃣ Prisma Known Request Error
  // ================================
  // 2. Prisma 錯誤 （例如 unique constraint）
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    return res.status(400).json({
      status: "error",
      code: err.code,
      message: err.meta?.target
        ? `${err.meta.target} already exists`
        : err.message,
    });
  }

  // ================================
  // 3️⃣ Prisma Validation Error
  // ================================
  if (err instanceof Prisma.PrismaClientValidationError) {
    return res.status(400).json({
      status: "error",
      message: "Invalid data sent to database",
    });
  }
  // 3. 自訂 AppError
  // ================================
  // 4️⃣ 自訂 AppError（例如登入錯誤）
  // ================================
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      status: "error",
      message: err.message,
    });
  }
  // 4. 一般 Error
  // ================================
  // 5️⃣ 一般 Error（非預期錯誤）
  // ================================
  if (err instanceof Error) {
    return res.status(500).json({
      status: "error",
      message: err.message,
    });
  }

  // 5. 其他未知錯誤
  // ================================
  // 6️⃣ 未知錯誤（無法辨識）
  // ================================
  return res.status(500).json({
    status: "error",
    message: "Unknown server error",
  });
};
