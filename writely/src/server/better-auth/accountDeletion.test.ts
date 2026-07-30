import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const schema = readFileSync(
  fileURLToPath(new URL("../../../prisma/schema.prisma", import.meta.url)),
  "utf8",
);

describe("account deletion data coverage", () => {
  it.each(["Document", "AiDailyUsage", "Feedback", "Session", "Account"])(
    "cascades the %s relation when its user is deleted",
    (modelName) => {
      const model = new RegExp(`model ${modelName} \\{([\\s\\S]*?)\\n\\}`).exec(
        schema,
      )?.[1];

      expect(model).toBeDefined();
      expect(model).toContain("onDelete: Cascade");
    },
  );

  it("keeps all user-owned relations on the user row", () => {
    const userModel = /model User \{([\s\S]*?)\n\}/.exec(schema)?.[1];

    expect(userModel).toContain("sessions");
    expect(userModel).toContain("documents");
    expect(userModel).toContain("aiDailyUsage");
    expect(userModel).toContain("feedback");
    expect(userModel).toContain("accounts");
  });
});
