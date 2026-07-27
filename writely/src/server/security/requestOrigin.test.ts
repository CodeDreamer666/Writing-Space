import { describe, expect, it } from "vitest";
import { isSameOriginRequest } from "./requestOrigin";

function request({
  origin,
  host = "writely.example",
  protocol = "https",
  forwardedHost,
}: {
  origin?: string;
  host?: string;
  protocol?: string;
  forwardedHost?: string;
}) {
  const headers = new Headers({
    host,
    "x-forwarded-proto": protocol,
  });

  if (origin) {
    headers.set("origin", origin);
  }

  if (forwardedHost) {
    headers.set("x-forwarded-host", forwardedHost);
  }

  return {
    headers,
    url: `${protocol}://${host}/api/trpc/docs.saveDoc`,
  };
}

describe("same-origin API protection", () => {
  it("accepts the request URL origin", () => {
    expect(
      isSameOriginRequest(
        request({
          origin: "https://writely.example",
        }),
      ),
    ).toBe(true);
  });

  it("rejects cross-origin, missing-origin, protocol mismatch, and spoofed forwarded hosts", () => {
    expect(
      isSameOriginRequest(
        request({
          origin: "https://attacker.example",
        }),
      ),
    ).toBe(false);
    expect(isSameOriginRequest(request({}))).toBe(false);
    expect(
      isSameOriginRequest(
        request({
          origin: "http://writely.example",
        }),
      ),
    ).toBe(false);
    expect(
      isSameOriginRequest(
        request({
          origin: "https://attacker.example",
          forwardedHost: "attacker.example",
        }),
      ),
    ).toBe(false);
  });
});
