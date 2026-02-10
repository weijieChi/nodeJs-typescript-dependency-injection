import morgan from "morgan";
import { logger } from "./winston.logger.js";

const stream = {
  write: (message: string) => {
    logger.info(JSON.parse(message)); // 寫入 winston
  },
};
morgan.format("http-json", (tokens, req, res) => {
  return JSON.stringify({
    type: "http", // 用於表示 log 的來源
    remoteAddr: tokens["remote-addr"]?.(req, res) ?? "-",
    method: tokens.method?.(req, res) ?? "-", // ?. ??
    url: tokens.url?.(req, res) ?? "-",
    status: Number(tokens.status?.(req, res) ?? 0),
    session: tokens.session?.(req, res) ?? "-",
    contentLength: tokens.res?.(req, res, "content-length") ?? "-",
    responseTimeMs: Number(tokens["response-time"]?.(req, res) ?? 0),
  });
});

export const httpLogger = morgan("http-json", { stream });
