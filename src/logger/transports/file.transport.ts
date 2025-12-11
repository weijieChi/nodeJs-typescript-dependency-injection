import { transports, format } from "winston";

export const fileTransport = new transports.File({
  filename: "./logs/app.log.json",
  level: "info",
  format: format.combine(format.timestamp(), format.json()),
});
