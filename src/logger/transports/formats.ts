import winston from "winston";

export const logFormat = winston.format.combine(
  // 加上時間戳
  winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),

  // 如果 log 是 Error，自動把 stack 印出來
  winston.format.errors({ stack: true }),

  // 最終輸出成 JSON（機器友善）
  winston.format.json(),
);
