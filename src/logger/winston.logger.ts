import { createLogger, format } from "winston";
import { consoleTransport } from "./transports/console.transport.js";
import { fileTransport } from "./transports/file.transport.js";
import { dailyRotateTransport } from "./transports/daily-rotate.transport.js";

export const logger = createLogger({
  level: "info",
  format: format.combine(format.timestamp(), format.json()),
  transports: [
    consoleTransport, // 開發模式用
    fileTransport, // 固定檔案（可選）
    dailyRotateTransport, // 每日分檔（建議）
  ],
});
