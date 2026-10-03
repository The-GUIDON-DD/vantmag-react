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
  const data = await fetch(`${BASE_URL}/media/${id}?_fields=description`).then(
    (res) => res.json(),
  );
  const parsedData: MediaResponse = MediaSchema.parse(data);

  return parsedData.description.rendered;
}

export async function retrieveArticleFromSlug(
  slug: string,
): Promise<ArticleData> {
  const data = await fetch(
    `${BASE_URL}/posts?slug=${slug}&_fields=slug,date,title.rendered,content.rendered,excerpt.rendered,categories,authors,featured_media`,
  ).then((res) => res.json());

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
  page = 1,
): Promise<ArticleSearchResults> {
  const response = await fetch(
    `${BASE_URL}/posts?search=${encodeURIComponent(term)}&page=${page}&_fields=slug,date,title.rendered,excerpt.rendered,categories,authors,featured_media`,
  );
  const data = await response.json();
  const parsedData: SearchArticleResponse = SearchArticleSchema.parse(data);

  const articles: ArticleCardData[] = parsedData.map((article) => ({
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
    totalPages: Number(response.headers.get("X-WP-TotalPages")) || 1,
  };
}

export async function retrieveAuthorsFromSearch(
  term: string,
): Promise<Author[]> {
  const data = await fetch(
    `${BASE_URL}/ppma_author?search=${encodeURIComponent(term)}&_fields=slug,name`,
  ).then((res) => res.json());

  const parsedData: AuthorSearchResponse = AuthorSearchSchema.parse(data);

  return parsedData.map(({ slug, name }) => ({ slug, display_name: name }));
}
