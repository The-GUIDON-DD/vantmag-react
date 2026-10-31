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

  it("returns the Food category for known ID", async () => {
    const result = categoryFromID(12);
    expect(result.id).toBe(12);
    expect(result.title).toBe("Food");
    expect(result.path).toEqual("/category/food");
  });

  it("returns the Theater & Arts category for known ID", async () => {
    const result = categoryFromID(11);
    expect(result.id).toBe(11);
    expect(result.title).toBe("Theater & Arts");
    expect(result.path).toEqual("/category/theater-and-the-arts");
  });

  it("returns the Music category for known ID", async () => {
    const result = categoryFromID(4);
    expect(result.id).toBe(4);
    expect(result.title).toBe("Music");
    expect(result.path).toEqual("/category/music");
  });

  it("returns the Hype category for known ID", async () => {
    const result = categoryFromID(243);
    expect(result.id).toBe(243);
    expect(result.title).toBe("Hype");
    expect(result.path).toEqual("/category/hype");
  });

  it("returns the Hub category for known ID", async () => {
    const result = categoryFromID(242);
    expect(result.id).toBe(242);
    expect(result.title).toBe("Hub");
    expect(result.path).toEqual("/category/hub");
  });

  it("returns the Expose category for known ID", async () => {
    const result = categoryFromID(244);
    expect(result.id).toBe(244);
    expect(result.title).toBe("Exposé");
    expect(result.path).toEqual("/category/expose");
  });

  it("returns the Other category when passed known ID", async () => {
    const result = categoryFromID(1);
    expect(result.id).toBe(1);
    expect(result.title).toBe("Other");
    expect(result.path).toEqual("/category/other");
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
