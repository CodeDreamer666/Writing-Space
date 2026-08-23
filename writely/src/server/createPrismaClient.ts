import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import { env } from "~/env";
import { PrismaClient } from "../../generated/prisma/client";

export default function createPrismaClient() {
  const pool = new pg.Pool({ connectionString: env.DATABASE_URL });
  const adapter = new PrismaPg(pool);

  return new PrismaClient({
    adapter,
    log: env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });
}
