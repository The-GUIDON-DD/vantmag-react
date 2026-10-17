import { afterEach, describe, expect, it, vi } from "vitest";
import postsFixture from "./__fixtures__/posts.json";
import { retrieveCategoryPosts, retrieveHomeData } from "./fetchers";
import { plainText, postDate } from "./utils";

/**
 * The fixture is a real response captured from the live WordPress install, so
 * these cover the actual field shapes (PublishPress `authors`, entity-encoded
 * titles) rather than an idealised version of them.
 */
function mockApi() {
  return vi.spyOn(globalThis, "fetch").mockImplementation(() =>
    Promise.resolve(
      new Response(JSON.stringify(postsFixture), {
        headers: { "X-WP-TotalPages": "5" },
      }),
    ),
  );
}

afterEach(() => vi.restoreAllMocks());

describe("plainText", () => {
  it("strips the markup WordPress wraps excerpts in", () => {
    expect(plainText("<p>Hello <strong>there</strong></p>")).toBe(
      "Hello there",
    );
  });

  // `plainText` only decodes HTML entities where `DOMParser` exists. Outside a
  // browser it falls back to stripping tags, so `&amp;` survives. That is fine
  // while the app is client-rendered, but would show raw entities if SSR is
  // ever enabled.
  it("decodes entities in a browser and strips tags everywhere", () => {
    const decoded = typeof DOMParser !== "undefined";
    expect(plainText("Tom &amp; Jerry")).toBe(
      decoded ? "Tom & Jerry" : "Tom &amp; Jerry",
    );
  });
});

describe("postDate", () => {
  it("formats a WordPress local datetime", () => {
    expect(postDate("2026-09-22T16:51:36")).toBe("September 22, 2026");
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

  it("returns cards the ArticleCard component can render", async () => {
    mockApi();
    const { hero } = await retrieveHomeData();

    expect(hero).toMatchObject({
      id: expect.any(Number),
      slug: expect.any(String),
      title: expect.any(String),
      pubDate: expect.any(String),
      featured_media: expect.any(Number),
    });
    expect(Array.isArray(hero?.authors)).toBe(true);
  });

  it("asks for one page of posts, not one request per card", async () => {
    const fetchSpy = mockApi();
    await retrieveHomeData();

    expect(fetchSpy).toHaveBeenCalledTimes(1);
    expect(String(fetchSpy.mock.calls[0][0])).toContain("per_page=13");
  });

  it("gives suggestions a stable order across calls", async () => {
    mockApi();
    const first = await retrieveHomeData();
    const second = await retrieveHomeData();

    expect(first.suggestions.map((p) => p.slug)).toEqual(
      second.suggestions.map((p) => p.slug),
    );
  });

  it("throws a readable error when the API fails", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response("", { status: 503 }),
    );

    await expect(retrieveHomeData()).rejects.toThrow("503");
  });
});

describe("retrieveCategoryPosts", () => {
  it("passes the category and paging through to the API", async () => {
    const fetchSpy = mockApi();
    await retrieveCategoryPosts(13, 9, 6);

    const url = String(fetchSpy.mock.calls[0][0]);
    expect(url).toContain("categories=13");
    expect(url).toContain("offset=9");
    // One extra is requested so the caller can tell whether more exist.
    expect(url).toContain("per_page=7");
  });
});
