import { app } from "./app.js";
import { logger } from "./logger/index.js"; // 在 server.ts 啟動 Log

const PORT = 3000;
app.listen(PORT, () => {
  logger.info(`🚀 Server running on http://localhost:${PORT}`);
});
