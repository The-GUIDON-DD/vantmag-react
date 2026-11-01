import { describe, expect, it } from "vitest";
import { categoryFromID, plainTextFallback } from "./utils";

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
});

describe("plainTextFallback", () => {
  describe("Content Purge", () => {
    it("completely removes <script> blocks", () => {
      expect(plainTextFallback("<script>alert(1)</script>")).toBe("");
    });

    it("completely removes <style> blocks", () => {
      expect(plainTextFallback("<style>.css{color:red}</style>")).toBe("");
    });

    it("is case-insensitive for <SCRIPT> and <STYLE> tags", () => {
      expect(plainTextFallback("<SCRIPT>alert(1)</SCRIPT>")).toBe("");
      expect(plainTextFallback("<STYLE>body{color:red}</STYLE>")).toBe("");
    });
  });

  describe("Intelligent Tag Stripping", () => {
    it("removes standard HTML tags but preserves inner text", () => {
      expect(plainTextFallback("<strong>Bold</strong>")).toBe("Bold");
      expect(plainTextFallback("<em>Italic</em>")).toBe("Italic");
      expect(plainTextFallback("<a href='test'>Link</a>")).toBe("Link");
      expect(plainTextFallback("<div>Div<p>Para</p></div>")).toBe("Div Para");
    });

    it("preserves mathematical expressions like '5 < 10'", () => {
      expect(plainTextFallback("5 < 10")).toBe("5 < 10");
      expect(plainTextFallback("12 > 8")).toBe("12 > 8");
    });

    it("preserves bracketed text that doesn't look like a tag", () => {
      expect(plainTextFallback("The [New] Era")).toBe("The [New] Era");
      expect(plainTextFallback("Value (approx 10)")).toBe("Value (approx 10)");
    });
  });

  describe("WordPress API titles", () => {
    it("handles mixed formatting commonly found in WordPress rendered titles", () => {
      const input =
        "Title <strong>with bold</strong>, <em>italics</em>, and <a href='#'>a link</a>";
      expect(plainTextFallback(input)).toBe(
        "Title with bold, italics, and a link",
      );
    });
  });

  describe("General Robustness", () => {
    it("removes HTML comments", () => {
      expect(plainTextFallback("Text <!-- hidden comment --> more text")).toBe(
        "Text more text",
      );
    });

    it("removes HTML comments containing '>' characters", () => {
      expect(
        plainTextFallback("Text <!-- comment > with bracket --> more text"),
      ).toBe("Text more text");
    });

    it("ensures elements between text have a space between them", () => {
      expect(plainTextFallback("Do<p>This</p>")).toBe("Do This");
    });

    it("handles Unicode and RTL characters", () => {
      expect(plainTextFallback("<span>Привет</span>")).toBe("Привет");
      expect(plainTextFallback("<span>שלום</span>")).toBe("שלום");
    });

    it("handles empty strings and whitespace-only strings", () => {
      expect(plainTextFallback("")).toBe("");
      expect(plainTextFallback("   ")).toBe("");
      expect(plainTextFallback("\n\t")).toBe("");
    });

    it("handles malformed HTML gracefully", () => {
      expect(plainTextFallback("<p This is a title")).toBe(
        "<p This is a title",
      );
      expect(plainTextFallback("Title > with closing only")).toBe(
        "Title > with closing only",
      );
      expect(plainTextFallback("Title < with opening only")).toBe(
        "Title < with opening only",
      );
    });
  });
});
