import { PrismaClient } from "../../src/generated/prisma/client.js";
import { HashHelper } from "../../src/utils/hash.js";
import crypto from "crypto";

const prisma = new PrismaClient();

const users = [
  { name: "user1", email: "user1@example.com", password: "12345" },
  { name: "user2", email: "user2@example.com", password: "12345" },
  { name: "user3", email: "user3@example.com", password: "12345" },
];

export default async function seedUsers() {
  // await prisma.user.deleteMany();

  const data = await Promise.all(
    users.map(async (u) => ({
      name: u.name,
      email: u.email,
      password: await HashHelper.hashPassword(u.password),
      securityStamp: crypto.randomUUID(),
    })),
  );

  await prisma.user.createMany({
    data,
  });
}
