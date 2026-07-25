import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import AiUsageMeter, { getAiRemainingPercentage } from "./AiUsageMeter";

describe("AiUsageMeter", () => {
  it("calculates and caps the remaining daily allowance", () => {
    expect(getAiRemainingPercentage(3_750)).toBe(75);
    expect(getAiRemainingPercentage(-100)).toBe(0);
    expect(getAiRemainingPercentage(8_000)).toBe(100);
  });

  it("shows a user-friendly progress summary without raw token numbers", () => {
    const markup = renderToStaticMarkup(
      <AiUsageMeter remainingTokens={2_500} />,
    );

    expect(markup).toContain("AI usage today");
    expect(markup).toContain("50% left");
    expect(markup).not.toContain("justify-end");
    expect(markup).toContain("Resets tomorrow");
    expect(markup).not.toContain("2,500 tokens");
  });
});
