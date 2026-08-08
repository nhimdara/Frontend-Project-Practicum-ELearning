import { describe, expect, it } from "vitest";
import { API_BASE_URL, API_ORIGIN } from "./api";

describe("API configuration", () => {
  it("normalizes the API path exactly once", () => {
    expect(API_BASE_URL.endsWith("/api")).toBe(true);
    expect(API_BASE_URL.endsWith("/api/api")).toBe(false);
    expect(API_ORIGIN.endsWith("/api")).toBe(false);
  });
});
