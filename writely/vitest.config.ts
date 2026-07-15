import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      "~": fileURLToPath(new URL("./src", import.meta.url)),
      "server-only": fileURLToPath(
        new URL("./src/test/serverOnly.ts", import.meta.url),
      ),
    },
  },
  test: {
    environment: "node",
    env: {
      BETTER_AUTH_URL: "http://localhost:3000",
      DATABASE_URL: "postgresql://test:test@localhost:5432/writely_test",
      GOOGLE_CLIENT_ID: "test-client-id",
      GOOGLE_CLIENT_SECRET: "test-client-secret",
      GROQ_API_KEY: "test-groq-key",
    },
  },
});
