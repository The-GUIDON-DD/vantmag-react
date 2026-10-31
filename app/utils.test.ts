import { describe, expect, it } from "vitest";
import { categoryFromID } from "./utils";

describe("categoryFromID", () => {
  it("returns a valid category when passed a known category ID defined in constants.ts", async () => {
    const result = categoryFromID(13);

    // The category with id 13 exists in constants.ts
    expect(result.id).toBe(13);
    expect(result.title).toBe("TV & Film");
    expect(result.path).toEqual("/category/tv-and-film");
  });

  it("returns 'Other' category for another invalid ID", async () => {
    const invalidIDs = [999, -1];
    for (const invalidID of invalidIDs) {
      const result = categoryFromID(invalidID);
      expect(result.id).toBe(1);
      expect(result.title).toBe("Other");
    }
  });
});
