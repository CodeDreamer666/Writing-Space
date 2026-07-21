import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import AiUsageMeter, { getAiUsagePercentage } from "./AiUsageMeter";

describe("AiUsageMeter", () => {
  it("calculates and caps daily usage", () => {
    expect(getAiUsagePercentage(3_750)).toBe(25);
    expect(getAiUsagePercentage(-100)).toBe(100);
    expect(getAiUsagePercentage(8_000)).toBe(0);
  });

  it("shows a user-friendly progress summary without raw token numbers", () => {
    const markup = renderToStaticMarkup(
      <AiUsageMeter remainingTokens={2_500} />,
    );

    expect(markup).toContain("AI usage today");
    expect(markup).toContain("50% used");
    expect(markup).toContain("Resets tomorrow");
    expect(markup).not.toContain("2,500 tokens");
  });
});
