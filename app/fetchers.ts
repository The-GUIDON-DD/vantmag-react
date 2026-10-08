import { z } from "zod";
import { type ArticleData, BASE_URL, type CategoryPostsPage } from "./types";

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

const MediaSchema = z.object({
  description: z.object({ rendered: z.string() }),
});

const CategoryPostsSchema = z
  .object({
    id: z.number(),
    date: z.iso.datetime({ local: true }),
    link: z.string(),
    slug: z.string(),
    title: z.object({ rendered: z.string() }),
    excerpt: z.object({ rendered: z.string() }),
    featured_media: z.number(),
    authors: z
      .object({ slug: z.string(), display_name: z.string() })
      .array()
      .optional(),
  })
  .array();

type MediaResponse = z.infer<typeof MediaSchema>;
type ArticleResponse = z.infer<typeof ArticleSchema>;

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
    "id,date,link,slug,title,excerpt,authors,featured_media",
  );

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Could not load articles (${response.status})`);
  }

  const posts = CategoryPostsSchema.parse(await response.json());
  return {
    posts: posts.slice(0, pageSize),
    hasMore: posts.length > pageSize,
  };
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

  const date = new Date(article.date);
  const formattedDate = new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date);

  return {
    title: article.title.rendered,
    slug: slug,
    authors: article.authors,
    featured_image: article.featured_media,
    category: article.categories[0],
    pubDate: formattedDate,
    excerpt: article.excerpt.rendered,
    content: article.content.rendered,
  };
}
