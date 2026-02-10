import type { Prisma } from "../generated/prisma/client.js";

export type SessionWithUser = Prisma.SessionGetPayload<{
  include: {
    user: {
      select: {
        id: true;
        name: true;
        email: true;
        createdAt: true;
        updatedAt: true;
      };
    };
  };
}>;
