import { z } from "zod";
import {
  type ArticleCardData,
  type ArticleData,
  type Author,
  BASE_URL,
  type CategoryPostsPage,
} from "./types";
import { formatDate, plainText } from "./utils";

const AuthorSchema = z.object({
  id: z.number(),
  name: z.string(),
  slug: z.string(),
});

const ArticleAuthorSchema = z.object({
  term_id: z.number(),
  display_name: z.string(),
  slug: z.string(),
});

const ArticleSchema = z.object({
  id: z.number(),
  title: z.object({ rendered: z.string() }),
  slug: z.string(),
  authors: ArticleAuthorSchema.array().optional(),
  categories: z.number().array(),
  featured_media: z.number(),
  date: z.iso.datetime({ local: true }),
  excerpt: z.object({ rendered: z.string() }),
  content: z.object({ rendered: z.string() }),
});

const MediaSchema = z.object({
  description: z.object({ rendered: z.string() }),
});

const CategoryPostSchema = ArticleSchema.omit({
  content: true,
});

type MediaResponse = z.infer<typeof MediaSchema>;
type ArticleResponse = z.infer<typeof ArticleSchema>;
type CategoryPostResponse = z.infer<typeof CategoryPostSchema>;
type AuthorResponse = z.infer<typeof AuthorSchema>;
type ArticleAuthorResponse = z.infer<typeof ArticleAuthorSchema>;

function articleAuthorToAuthor(articleAuthor: ArticleAuthorResponse): Author {
  return {
    id: articleAuthor.term_id,
    slug: articleAuthor.slug,
    display_name: articleAuthor.display_name,
  };
}

function articleResponseToArticleData(articleRes: ArticleResponse) {
  const cleanTitle = plainText(articleRes.title.rendered);
  const cleanAuthors = articleRes.authors
    ? articleRes.authors.map(articleAuthorToAuthor)
    : [];
  return {
    id: articleRes.id,
    title: cleanTitle,
    slug: articleRes.slug,
    authors: cleanAuthors,
    featured_media: articleRes.featured_media,
    category: articleRes.categories[0],
    pubDate: formatDate(new Date(articleRes.date)),
    excerpt: articleRes.excerpt.rendered,
    content: articleRes.content.rendered,
  };
}

function categoryPostResponseToArticleCardPost(
  categoryPostRes: CategoryPostResponse,
) {
  const cleanAuthors = categoryPostRes.authors
    ? categoryPostRes.authors.map(articleAuthorToAuthor)
    : [];
  return {
    id: categoryPostRes.id,
    title: categoryPostRes.title.rendered,
    slug: categoryPostRes.slug,
    authors: cleanAuthors,
    category: categoryPostRes.categories[0],
    featured_media: categoryPostRes.featured_media,
    pubDate: formatDate(new Date(categoryPostRes.date)),
    excerpt: categoryPostRes.excerpt.rendered,
  };
}

export async function retrieveCategoryPosts(
  categoryId: number,
  offset: number,
  pageSize: number,
): Promise<CategoryPostsPage> {
  const url = new URL(`${BASE_URL}/posts`);
  url.searchParams.set("categories", String(categoryId));
  url.searchParams.set("orderby", "date");
  url.searchParams.set("order", "desc");
  url.searchParams.set("offset", String(offset));
  url.searchParams.set("per_page", String(pageSize + 1));
  url.searchParams.set(
    "_fields",
    "id,date,categories,link,slug,title,excerpt,authors,featured_media",
  );

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Could not load articles (${response.status})`);
  }

  const totalPages = parseInt(
    response.headers.get("X-WP-TotalPages") || "0",
    10,
  );

  const postResponses: CategoryPostResponse[] =
    CategoryPostSchema.array().parse(await response.json());
  const posts = postResponses.map(categoryPostResponseToArticleCardPost);

  return {
    posts: posts.slice(0, pageSize),
    hasMore: offset < totalPages - 1,
  };
}

export async function retrieveMediaFromID(id: number) {
  const mediaUrl = new URL(`${BASE_URL}/media/${id}`);
  mediaUrl.searchParams.set("_fields", "description");
  const text = await fetch(mediaUrl).then((res) => res.text());
  // Some responses start with a PHP warning from a WordPress plugin, so skip to the JSON.
  const parsedData: MediaResponse = MediaSchema.parse(
    JSON.parse(text.slice(text.indexOf("{"))),
  );

  return parsedData.description.rendered;
}

export async function retrieveArticleFromSlug(
  slug: string,
): Promise<ArticleData> {
  const fields = [
    "id",
    "slug",
    "date",
    "title.rendered",
    "content.rendered",
    "excerpt",
    "categories",
    "authors",
    "featured_media",
  ];
  const articleUrl = new URL(`${BASE_URL}/posts`);
  articleUrl.searchParams.set("slug", slug);
  articleUrl.searchParams.set(
    "_fields",
    fields.map(encodeURIComponent).join(","),
  );

  const data = await fetch(articleUrl).then((res) => res.json());

  const parsedData: ArticleResponse[] = ArticleSchema.array().parse(data);
  const articleRes = parsedData[0];

  return articleResponseToArticleData(articleRes);
}

export async function retrieveRelatedArticles(
  article: ArticleData,
): Promise<Array<ArticleCardData>> {
  const fields = [
    "id",
    "slug",
    "date",
    "title.rendered",
    "categories",
    "authors",
    "featured_media",
  ];
  const url = new URL(`${BASE_URL}/posts`);
  url.searchParams.set("categories", String(article.category));
  url.searchParams.set("exclude", String(article.id));
  url.searchParams.set("per_page", String(3));
  url.searchParams.set("fields", fields.join(","));

  const data = await fetch(url).then((res) => res.json());
  const parsedData: CategoryPostResponse[] =
    CategoryPostSchema.array().parse(data);

  return parsedData.map(categoryPostResponseToArticleCardPost);
}

export async function retrieveAuthorFromSlug(slug: string): Promise<Author> {
  const fields = ["id", "name", "slug"];
  const url = new URL(`${BASE_URL}/ppma_author`);
  url.searchParams.set("slug", slug);
  url.searchParams.set("_fields", fields.join(","));

  const data = await fetch(url).then((res) => res.json());
  const parsedData: AuthorResponse[] = AuthorSchema.array().parse(data);
  if (parsedData.length < 1) {
    throw new Error("Author not found.");
  }
  const author = parsedData[0];

  return {
    id: author.id,
    display_name: author.name,
    slug: author.slug,
  };
}

export async function retrieveArticlesFromAuthor(
  author_id: number,
  offset: number,
  pageSize: number,
): Promise<{ posts: Array<ArticleCardData>; hasMore: boolean }> {
  const fields = [
    "id",
    "slug",
    "date",
    "title.rendered",
    "content.rendered",
    "excerpt",
    "categories",
    "authors",
    "featured_media",
  ];

  const url = new URL(`${BASE_URL}/posts`);
  // NOTE: This is because we use the PublishPress Authors Plugin.
  // If the API changes or we use a different plugin, THIS FUNCTION MUST BE CHANGED
  url.searchParams.set("ppma_author", String(author_id));
  url.searchParams.set("orderby", "date");
  url.searchParams.set("order", "desc");
  url.searchParams.set("offset", String(offset));
  url.searchParams.set("per_page", String(pageSize + 1));
  url.searchParams.set("_fields", fields.map(encodeURIComponent).join(","));

  const res = await fetch(url);
  const totalPages = parseInt(res.headers.get("X-WP-TotalPages") || "0", 10);

  const data = await res.json();

  const parsedData: CategoryPostResponse[] =
    CategoryPostSchema.array().parse(data);

  const posts = parsedData.map(categoryPostResponseToArticleCardPost);

  return {
    posts,
    hasMore: offset < totalPages - 1,
  };
}

const TagSchema = z.object({
  id: z.number(),
  name: z.string(),
  slug: z.string(),
});

type TagResponse = z.infer<typeof TagSchema>;

const SEARCH_POST_FIELDS =
  "id,date,categories,link,slug,title,excerpt,authors,featured_media";

export async function retrieveArticlesFromSearch(
  term: string,
  offset: number,
  pageSize: number,
): Promise<CategoryPostsPage> {
  const url = new URL(`${BASE_URL}/posts`);
  url.searchParams.set("search", term);
  // Same order as the original site: title matches first.
  url.searchParams.set("orderby", "relevance");
  url.searchParams.set("offset", String(offset));
  // Request one extra post to know if there are more results without
  // risking an out-of-range page error from WordPress.
  url.searchParams.set("per_page", String(pageSize + 1));
  url.searchParams.set("_fields", SEARCH_POST_FIELDS);

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Could not load search results (${response.status})`);
  }

  const postResponses: CategoryPostResponse[] =
    CategoryPostSchema.array().parse(await response.json());
  const posts = postResponses.map(categoryPostResponseToArticleCardPost);

  return {
    posts: posts.slice(0, pageSize),
    hasMore: posts.length > pageSize,
  };
}

export async function retrieveTagsFromSearch(
  term: string,
): Promise<TagResponse[]> {
  const url = new URL(`${BASE_URL}/tags`);
  url.searchParams.set("search", term);
  // Match the original site, which only lists tags that have posts.
  url.searchParams.set("hide_empty", "true");
  url.searchParams.set("per_page", "10");
  url.searchParams.set("_fields", "id,name,slug");

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Could not load tags (${response.status})`);
  }

  return TagSchema.array().parse(await response.json());
}

// The original site shows random posts when a search has no results. The REST
// API has no random order, so read the post count and start at a random offset.
export async function retrieveFeaturedPosts(
  count: number,
): Promise<Array<ArticleCardData>> {
  const countUrl = new URL(`${BASE_URL}/posts`);
  countUrl.searchParams.set("per_page", "1");
  countUrl.searchParams.set("_fields", "id");
  const countResponse = await fetch(countUrl);
  const total = parseInt(countResponse.headers.get("X-WP-Total") || "0", 10);

  const url = new URL(`${BASE_URL}/posts`);
  url.searchParams.set(
    "offset",
    String(Math.floor(Math.random() * Math.max(total - count, 0))),
  );
  url.searchParams.set("per_page", String(count));
  url.searchParams.set("_fields", SEARCH_POST_FIELDS);

  const data = await fetch(url).then((res) => res.json());
  const parsedData: CategoryPostResponse[] =
    CategoryPostSchema.array().parse(data);

  return parsedData.map(categoryPostResponseToArticleCardPost);
}
