import { z } from "zod";
import { type ArticleData, BASE_URL, type CategoryPostsPage } from "./types";
import { formatDate } from "./utils";

const ArticleSchema = z.object({
  id: z.number(),
  title: z.object({ rendered: z.string() }),
  slug: z.string(),
  authors: z
    .object({ slug: z.string(), display_name: z.string() })
    .array()
    .optional(),
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
  categories: true,
});

type MediaResponse = z.infer<typeof MediaSchema>;
type ArticleResponse = z.infer<typeof ArticleSchema>;
type CategoryPostResponse = z.infer<typeof CategoryPostSchema>;

function articleResponseToArticleData(articleRes: ArticleResponse) {
  return {
    id: articleRes.id,
    title: articleRes.title.rendered,
    slug: articleRes.slug,
    authors: articleRes.authors,
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
  return {
    id: categoryPostRes.id,
    title: categoryPostRes.title.rendered,
    slug: categoryPostRes.slug,
    authors: categoryPostRes.authors,
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
    "id,date,link,slug,title,excerpt,authors,featured_media",
  );

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Could not load articles (${response.status})`);
  }

  const postResponses: CategoryPostResponse[] =
    CategoryPostSchema.array().parse(await response.json());
  const posts = postResponses.map(categoryPostResponseToArticleCardPost);

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
