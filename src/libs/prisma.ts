import "dotenv/config";
import { PrismaClient } from "../generated/prisma/client.js";

// Prisma v6 會自動使用 DATABASE_URL
const prisma = new PrismaClient();

export { prisma };
