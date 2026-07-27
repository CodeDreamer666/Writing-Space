import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

function readSource(relativePath: string) {
  return readFileSync(
    fileURLToPath(new URL(`../../${relativePath}`, import.meta.url)),
    "utf8",
  );
}

describe("sensitive logging safety", () => {
  it("does not enable client input logging or Prisma query-value logging", () => {
    const trpcClient = readSource("trpc/react.tsx");
    const database = readSource("server/db.ts");

    expect(trpcClient).not.toContain("loggerLink");
    expect(database).not.toContain('"query"');
  });

  it("logs only route and error codes, not request bodies or AI errors", () => {
    const route = readSource("app/api/trpc/[trpc]/route.ts");
    const aiRouter = readSource("server/api/routers/ai.ts");

    expect(route).not.toContain("error.message");
    expect(route).not.toContain("req.body");
    expect(aiRouter).not.toContain("error instanceof Error ? error.message");
  });
});
