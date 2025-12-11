import DailyRotateFile from "winston-daily-rotate-file";
import { format } from "winston";

export const dailyRotateTransport = new DailyRotateFile({
  dirname: "logs",
  filename: "%DATE%-combined.log.json",
  datePattern: "YYYY-MM--DD",
  zippedArchive: false,
  maxFiles: "30d", // 保留 30 天
  level: "info",
  format: format.combine(format.timestamp(), format.json()),
});
