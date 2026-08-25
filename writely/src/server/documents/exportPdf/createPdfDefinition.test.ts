import { expect, test } from "vitest";
import createPdfDefinition from "./createPdfDefinition";

export default function createPdfDefinitionTest() {
  const definition = createPdfDefinition(
    {
      type: "doc",
      content: [{ type: "paragraph", content: [{ type: "text", text: "Test" }] }],
    },
    "Accessible export",
  );

  expect(definition.tagged).toBe(true);
  expect(definition.displayTitle).toBe(true);
}

test("marks PDF exports as tagged documents", createPdfDefinitionTest);
