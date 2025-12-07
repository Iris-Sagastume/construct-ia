import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma =
  globalForPrisma.prisma ?? new PrismaClient({ log: ["query", "error", "warn"] });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

// (opcional) desconexión limpia
process.once("SIGINT", async () => {
  await prisma.$disconnect();
  process.exit(0);
});
