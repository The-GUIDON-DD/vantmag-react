import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  retrieveArticleFromSlug,
  retrieveCategoryPosts,
  retrieveMediaFromID,
} from "./fetchers";

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

describe("retrieveArticleFromSlug", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });

  const mockApiArticle = {
    id: 1,
    title: { rendered: "Test Article" },
    slug: "test-article",
    authors: [
      {
        term_id: 10,
        display_name: "Test Author",
        slug: "test-author",
      },
    ],
    categories: [5],
    featured_media: 100,
    date: "2023-10-01T10:00:00Z",
    excerpt: { rendered: "Test excerpt" },
    content: { rendered: "Test content" },
  };

  it("returns an error if the fetch fails to resolve", async () => {
    vi.mocked(fetch).mockRejectedValueOnce(new Error("Network failure"));

    await expect(retrieveArticleFromSlug("test-article")).rejects.toThrow(
      "Network failure",
    );
  });

  it("returns an error if the fetch does not return a 200 (or ok: true)", async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: false,
      status: 404,
      json: async () => ({ message: "Not Found" }),
    } as Response);

    await expect(retrieveArticleFromSlug("test-article")).rejects.toThrow();
  });

  it("returns the correct ArticleData on success", async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => [mockApiArticle],
    } as Response);

    const result = await retrieveArticleFromSlug("test-article");

    expect(result).toEqual({
      id: 1,
      title: "Test Article",
      slug: "test-article",
      authors: [{ id: 10, slug: "test-author", display_name: "Test Author" }],
      featured_media: 100,
      category: 5,
      pubDate: expect.any(String),
      excerpt: "Test excerpt",
      content: "Test content",
    });
  });

  it("returns an error if no articles are found (empty array)", async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => [],
    } as Response);

    await expect(retrieveArticleFromSlug("non-existent")).rejects.toThrow();
  });
});

describe("retrieveCategoryPosts", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });

  const mockApiPosts = [
    {
      id: 1,
      title: { rendered: "Post 1" },
      slug: "post-1",
      authors: [{ term_id: 10, display_name: "Author 1", slug: "author-1" }],
      categories: [13],
      featured_media: 100,
      date: "2023-10-01T10:00:00Z",
      excerpt: { rendered: "Excerpt 1" },
    },
    {
      id: 2,
      title: { rendered: "Post 2" },
      slug: "post-2",
      authors: [{ term_id: 10, display_name: "Author 1", slug: "author-1" }],
      categories: [13],
      featured_media: 101,
      date: "2023-10-02T10:00:00Z",
      excerpt: { rendered: "Excerpt 2" },
    },
    {
      id: 3,
      title: { rendered: "Post 3" },
      slug: "post-3",
      authors: [{ term_id: 10, display_name: "Author 1", slug: "author-1" }],
      categories: [13],
      featured_media: 102,
      date: "2023-10-03T10:00:00Z",
      excerpt: { rendered: "Excerpt 3" },
    },
  ];

  it("returns posts and correctly calculates hasMore = true", async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      status: 200,
      headers: new Headers({ "X-WP-TotalPages": "2" }),
      json: async () => mockApiPosts,
    } as Response);

    const result = await retrieveCategoryPosts(13, 0, 2);

    expect(result.posts).toHaveLength(2);
    expect(result.posts[0].title).toBe("Post 1");
    expect(result.hasMore).toBe(true);
  });

  it("returns posts and correctly calculates hasMore = false (last page)", async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      status: 200,
      headers: new Headers({ "X-WP-TotalPages": "2" }),
      json: async () => mockApiPosts,
    } as Response);

    const result = await retrieveCategoryPosts(13, 1, 2);

    expect(result.hasMore).toBe(false);
  });

  it("returns posts and correctly calculates hasMore = false (beyond total pages)", async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      status: 200,
      headers: new Headers({ "X-WP-TotalPages": "2" }),
      json: async () => mockApiPosts,
    } as Response);

    const result = await retrieveCategoryPosts(13, 2, 2);

    expect(result.hasMore).toBe(false);
  });

  it("returns an error if the fetch fails", async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: false,
      status: 500,
    } as Response);

    await expect(retrieveCategoryPosts(13, 0, 2)).rejects.toThrow(
      "Could not load articles (500)",
    );
  });

  it("returns an error for an invalid category ID (simulated 404)", async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: false,
      status: 404,
    } as Response);

    await expect(retrieveCategoryPosts(999, 0, 2)).rejects.toThrow(
      "Could not load articles (404)",
    );
  });

  it("returns an error for an invalid offset (simulated 400)", async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: false,
      status: 400,
    } as Response);

    await expect(retrieveCategoryPosts(13, -1, 2)).rejects.toThrow(
      "Could not load articles (400)",
    );
  });

  it("returns an error for an invalid pageSize (simulated 400)", async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: false,
      status: 400,
    } as Response);

    await expect(retrieveCategoryPosts(13, 0, -1)).rejects.toThrow(
      "Could not load articles (400)",
    );
  });
});
