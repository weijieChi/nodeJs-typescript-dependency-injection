import morgan from "morgan";
import { logger } from "./winston.logger.js";

const stream = {
  write: (message: string) => {
    logger.info(message.trim()); // 寫入 winston
  },
};

export const httpLogger = morgan("combined", { stream });
