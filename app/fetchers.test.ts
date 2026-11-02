import { beforeEach, describe, expect, it, vi } from "vitest";
import { retrieveMediaFromID } from "./fetchers";

describe("retrieveMediaFromID", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });

  it("returns an error if the fetch fails to resolve", async () => {
    vi.mocked(fetch).mockRejectedValueOnce(new Error("Network failure"));

    await expect(retrieveMediaFromID(123)).rejects.toThrow("Network failure");
  });

  it("returns an error if the fetch does not return a 200 (or ok: true)", async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: false,
      status: 404,
      json: async () => ({ message: "Not Found" }),
    } as Response);

    await expect(retrieveMediaFromID(123)).rejects.toThrow();
  });

  it("returns the rendered description on success", async () => {
    const mockDescription = "This is a test description";
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({
        description: { rendered: mockDescription },
      }),
    } as Response);

    const result = await retrieveMediaFromID(123);
    expect(result).toBe(mockDescription);
  });
});
