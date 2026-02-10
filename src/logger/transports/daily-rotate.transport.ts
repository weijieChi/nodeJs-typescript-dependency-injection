import DailyRotateFile from "winston-daily-rotate-file";
import { logFormat } from "./formats.js";

export const dailyRotateTransport = new DailyRotateFile({
  dirname: "logs",
  filename: "%DATE%-combined.log.json",
  datePattern: "YYYY-MM--DD",
  zippedArchive: false,
  maxFiles: "30d", // 保留 30 天
  maxSize: "20m", // 單檔最大 20MB
  level: "info",
  format: logFormat,
});
