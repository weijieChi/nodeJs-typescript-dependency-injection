import seedUsers from "./seeds/user-seed";
import { logger } from "../src/logger/winston.logger.js";

async function main() {
  logger.info("Seeding users...");
  await seedUsers();
}

main()
  .then(() => {
    logger.info("seeding finished");
  })
  .catch((e) => {
    logger.error("seeding error", { error: e });
    process.exit(1);
  });
