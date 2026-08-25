import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import { env } from "~/env";
import { PrismaClient } from "../../generated/prisma/client";

export default function createPrismaClient() {
  const databaseUrl = new URL(env.DATABASE_URL);
  const sslMode = databaseUrl.searchParams.get("sslmode");

  if (sslMode === "prefer" || sslMode === "require" || sslMode === "verify-ca") {
    databaseUrl.searchParams.set("sslmode", "verify-full");
  }

  const pool = new pg.Pool({ connectionString: databaseUrl.toString() });
  const adapter = new PrismaPg(pool);

  return new PrismaClient({
    adapter,
    log: env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });
}
