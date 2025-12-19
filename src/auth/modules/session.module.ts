import { SessionRepository } from "../repositories/session.repository.js";
import { SessionService } from "../services/session.service.js";
import type { PrismaClient } from "../../generated/prisma/client.js";

export function createSessionModule(prisma: PrismaClient) {
  const sessionRepository = new SessionRepository(prisma);
  const sessionService = new SessionService(sessionRepository);

  return {
    session: {
      repository: sessionRepository,
      services: sessionService,
  }
  }
}