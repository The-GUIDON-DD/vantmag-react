import { z } from "zod";
import {
  type ArticleCardData,
  type ArticleData,
  type ArticleSearchResults,
  type Author,
  BASE_URL,
} from "./types";

const ArticleSchema = z
  .object({
    title: z.object({ rendered: z.string() }),
    slug: z.string(),
    authors: z.object({ slug: z.string(), display_name: z.string() }).array(),
    categories: z.number().array(),
    featured_media: z.number(),
    date: z.iso.datetime({ local: true }),
    excerpt: z.object({ rendered: z.string() }),
    content: z.object({ rendered: z.string() }),
  })
  .array();

const SearchArticleSchema = ArticleSchema.element
  .omit({ content: true })
  .array();

const AuthorSearchSchema = z
  .object({
    slug: z.string(),
    name: z.string(),
  })
  .array();

const MediaSchema = z.object({
  description: z.object({ rendered: z.string() }),
});

type MediaResponse = z.infer<typeof MediaSchema>;
type ArticleResponse = z.infer<typeof ArticleSchema>;
type SearchArticleResponse = z.infer<typeof SearchArticleSchema>;
type AuthorSearchResponse = z.infer<typeof AuthorSearchSchema>;

function formatDate(isoDate: string) {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(isoDate));
}

export async function retrieveMediaFromID(id: number) {
  const mediaUrl = new URL(`${BASE_URL}/media/${id}`);
  mediaUrl.searchParams.set("_fields", "description");
  const data = await fetch(mediaUrl).then((res) => res.json());
  const parsedData: MediaResponse = MediaSchema.parse(data);

  return parsedData.description.rendered;
}

export async function retrieveArticleFromSlug(
  slug: string,
): Promise<ArticleData> {
  const fields = [
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

  const parsedData: ArticleResponse = ArticleSchema.parse(data);
  const article = parsedData[0];

  return {
    title: article.title.rendered,
    slug: slug,
    authors: article.authors,
    featured_image: article.featured_media,
    category: article.categories[0],
    pubDate: formatDate(article.date),
    excerpt: article.excerpt.rendered,
    content: article.content.rendered,
  };
}

export async function retrieveArticlesFromSearch(
  term: string,
  offset: number,
  pageSize: number,
): Promise<ArticleSearchResults> {
  const fields = [
    "slug",
    "date",
    "title.rendered",
    "excerpt.rendered",
    "categories",
    "authors",
    "featured_media",
  ];
  const searchUrl = new URL(`${BASE_URL}/posts`);
  searchUrl.searchParams.set("search", term);
  searchUrl.searchParams.set("offset", String(offset));
  // Request one extra post to know if there are more results without
  // risking an out-of-range page error from WordPress.
  searchUrl.searchParams.set("per_page", String(pageSize + 1));
  searchUrl.searchParams.set("_fields", fields.join(","));

  const response = await fetch(searchUrl);
  if (!response.ok) {
    throw new Error(`Could not load search results (${response.status})`);
  }
  const parsedData: SearchArticleResponse = SearchArticleSchema.parse(
    await response.json(),
  );

  const articles: ArticleCardData[] = parsedData
    .slice(0, pageSize)
    .map((article) => ({
      title: article.title.rendered,
      slug: article.slug,
      authors: article.authors,
      featured_image: article.featured_media,
      category: article.categories[0],
      pubDate: formatDate(article.date),
      excerpt: article.excerpt.rendered,
    }));

  return {
    articles,
    hasMore: parsedData.length > pageSize,
  };
}

export async function retrieveAuthorsFromSearch(
  term: string,
): Promise<Author[]> {
  const authorUrl = new URL(`${BASE_URL}/ppma_author`);
  authorUrl.searchParams.set("search", term);
  authorUrl.searchParams.set("_fields", "slug,name");
  const response = await fetch(authorUrl);
  if (!response.ok) {
    throw new Error(`Could not load author results (${response.status})`);
  }
  const data = await response.json();

  const parsedData: AuthorSearchResponse = AuthorSearchSchema.parse(data);

  return parsedData.map(({ slug, name }) => ({ slug, display_name: name }));
}
