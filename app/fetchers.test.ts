import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  retrieveArticleFromSlug,
  retrieveAuthorFromSlug,
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

  it("throws an error for an invalid category ID before calling fetch", async () => {
    const invalidId = 999;
    await expect(retrieveCategoryPosts(invalidId, 0, 2)).rejects.toThrow(
      `Invalid category ID: ${invalidId}`,
    );
    expect(fetch).not.toHaveBeenCalled();
  });

  it("throws an error for a negative offset before calling fetch", async () => {
    const invalidOffset = -1;
    await expect(retrieveCategoryPosts(13, invalidOffset, 2)).rejects.toThrow(
      `Offset must be non-negative: ${invalidOffset}`,
    );
    expect(fetch).not.toHaveBeenCalled();
  });

  it("throws an error for a non-positive page size before calling fetch", async () => {
    const invalidPageSize = 0;
    await expect(retrieveCategoryPosts(13, 0, invalidPageSize)).rejects.toThrow(
      `Page size must be greater than zero: ${invalidPageSize}`,
    );
    expect(fetch).not.toHaveBeenCalled();
  });

  it("calls the WordPress API with the correct categoryID", async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      status: 200,
      headers: new Headers({ "X-WP-TotalPages": "1" }),
      json: async () => [],
    } as Response);

    const categoryId = 13;
    await retrieveCategoryPosts(categoryId, 0, 2);

    const calledUrl = vi.mocked(fetch).mock.calls[0][0] as URL;
    expect(calledUrl.pathname.endsWith("/posts")).toBe(true);
    expect(calledUrl.searchParams.get("categories")).toBe(String(categoryId));
  });

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

  it("returns posts and correctly calculates hasMore = false (beyond totalPages)", async () => {
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
});

describe("retrieveAuthorFromSlug", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });

  const mockApiAuthor = {
    id: 10,
    name: "Test Author",
    slug: "test-author",
  };

  it("returns an error if the fetch fails to resolve", async () => {
    vi.mocked(fetch).mockRejectedValueOnce(new Error("Network failure"));

    await expect(retrieveAuthorFromSlug("test-author")).rejects.toThrow(
      "Network failure",
    );
  });

  it("returns an error if the fetch response is not ok", async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: false,
      status: 404,
      json: async () => ({
        code: "rest_user_invalid_data",
        message: "Invalid data",
      }),
    } as Response);

    // Zod will throw a validation error even if the response is not 200
    await expect(retrieveAuthorFromSlug("test-author")).rejects.toThrow();
  });

  it("returns the correct Author data on success", async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => [mockApiAuthor],
    } as Response);

    const result = await retrieveAuthorFromSlug("test-author");

    expect(result).toEqual({
      id: 10,
      display_name: "Test Author",
      slug: "test-author",
    });
  });

  it("returns an error if no author is found (empty array)", async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => [],
    } as Response);

    await expect(retrieveAuthorFromSlug("non-existent")).rejects.toThrow(
      "Author not found.",
    );
  });

  it("calls the WordPress API with the correct parameters", async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => [mockApiAuthor],
    } as Response);

    const slug = "test-author";
    await retrieveAuthorFromSlug(slug);

    const calledUrl = vi.mocked(fetch).mock.calls[0][0] as URL;
    expect(calledUrl.pathname.endsWith("/ppma_author")).toBe(true);
    expect(calledUrl.searchParams.get("slug")).toBe(slug);
    expect(calledUrl.searchParams.get("_fields")).toBe("id,name,slug");
  });
});
