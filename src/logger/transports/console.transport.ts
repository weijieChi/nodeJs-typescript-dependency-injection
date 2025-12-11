import { transports, format } from "winston";

export const consoleTransport = new transports.Console({
  format: format.combine(
    format.colorize(),
    format.timestamp(),
    format.printf(({ level, message, timestamp }) => {
      return `[${timestamp}] ${level}: ${message}`;
    })
  ),
});
