import { afterEach, describe, expect, it, vi } from "vitest";
import mediaFixture from "./__fixtures__/media.json";
import postsFixture from "./__fixtures__/posts.json";
import { retrieveCategoryPosts, retrieveHomeData } from "./fetchers";
import { decodeEntities, formatDate, toPlainText } from "./utils";

/**
 * Fixtures are real responses captured from the live WordPress install, so
 * these cover the actual field shapes (PublishPress `authors`, nested
 * `media_details.sizes`) rather than an idealised version of them.
 */
function mockApi() {
  return vi.spyOn(globalThis, "fetch").mockImplementation((input) => {
    const url = String(input);
    const body = url.includes("/media?") ? mediaFixture : postsFixture;
    return Promise.resolve(new Response(JSON.stringify(body)));
  });
}

afterEach(() => vi.restoreAllMocks());

describe("decodeEntities", () => {
  it("decodes named, decimal and hex entities", () => {
    expect(decodeEntities("Tom &amp; Jerry")).toBe("Tom & Jerry");
    expect(decodeEntities("caf&#233;")).toBe("café");
    expect(decodeEntities("&#x2019;")).toBe("’");
    expect(decodeEntities("and &hellip;")).toBe("and …");
  });

  it("leaves unknown entities untouched", () => {
    expect(decodeEntities("&notareal; thing")).toBe("&notareal; thing");
  });
});

describe("toPlainText", () => {
  it("strips the markup WordPress wraps excerpts in", () => {
    expect(
      toPlainText("<p>Hello <strong>there</strong> [&hellip;]</p>\n"),
    ).toBe("Hello there […]");
  });
});

describe("formatDate", () => {
  it("formats a WordPress local datetime", () => {
    expect(formatDate("2026-09-22T16:51:36")).toBe("September 22, 2026");
  });
});

describe("retrieveHomeData", () => {
  it("splits the feed into hero, latest and suggestions", async () => {
    mockApi();
    const data = await retrieveHomeData();

    expect(data.hero?.slug).toBe(postsFixture[0].slug);
    expect(data.latest).toHaveLength(6);
    expect(data.suggestions).toHaveLength(6);
    // The hero is the newest post; `latest` continues from the one after it.
    expect(data.latest[0].slug).toBe(postsFixture[1].slug);
  });

  it("resolves featured images to a sized URL, not the raw upload", async () => {
    mockApi();
    const { hero } = await retrieveHomeData();

    expect(hero?.image).toBeTruthy();
    expect(hero?.image).toMatch(/-\d+x\d+\.\w+$/);
  });

  it("decodes titles and flattens authors", async () => {
    mockApi();
    const { hero } = await retrieveHomeData();

    expect(hero?.title).not.toContain("&#");
    expect(hero?.excerpt).not.toContain("<p>");
    expect(hero?.authors[0]).toHaveProperty("display_name");
    expect(typeof hero?.authors[0].avatar_url).toBe("string");
  });

  it("only assigns categories the site has chips for", async () => {
    mockApi();
    const { hero, latest } = await retrieveHomeData();

    for (const post of [hero, ...latest]) {
      expect(
        post?.category === null || typeof post?.category === "number",
      ).toBe(true);
    }
  });

  it("requests media once, batched, rather than per card", async () => {
    const fetchSpy = mockApi();
    await retrieveHomeData();

    const mediaCalls = fetchSpy.mock.calls.filter((c) =>
      String(c[0]).includes("/media?"),
    );
    expect(mediaCalls).toHaveLength(1);
    expect(String(mediaCalls[0][0])).toContain("include=");
  });

  it("gives suggestions a stable order across calls", async () => {
    mockApi();
    const first = await retrieveHomeData();
    const second = await retrieveHomeData();

    expect(first.suggestions.map((p) => p.slug)).toEqual(
      second.suggestions.map((p) => p.slug),
    );
  });
});

describe("retrieveCategoryPosts", () => {
  it("passes the category and page through to the API", async () => {
    const fetchSpy = mockApi();
    await retrieveCategoryPosts(13, 2, 9);

    const url = String(fetchSpy.mock.calls[0][0]);
    expect(url).toContain("categories=13");
    expect(url).toContain("per_page=9");
    expect(url).toContain("page=2");
  });
});
