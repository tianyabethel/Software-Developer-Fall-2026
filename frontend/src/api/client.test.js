import { describe, it, expect, vi, afterEach } from "vitest";
import { fetchProperties } from "./client";

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("fetchProperties", () => {
  it("returns properties when the request succeeds", async () => {
    const mockData = {
      total: 1,
      results: [{ L_ListingID: "TEST001", L_City: "Blythe" }],
    };

    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockData,
      })
    );

    await expect(fetchProperties()).resolves.toEqual(mockData);
    expect(fetch).toHaveBeenCalledWith("/api/properties");
  });

  it("throws a meaningful error for an HTTP failure", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
        json: async () => ({ error: "Failed to retrieve properties" }),
      })
    );

    await expect(fetchProperties()).rejects.toThrow(
      "Failed to retrieve properties"
    );
  });

  it("throws a helpful error when the network request fails", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("Network error")));

    await expect(fetchProperties()).rejects.toThrow(
      "Cannot reach the server"
    );
  });
});
