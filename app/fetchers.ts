import { z } from "zod";
import { categories } from "../constants";
import {
  type ArticleData,
  BASE_URL,
  type HomeData,
  type PostCard,
} from "./types";
import { decodeEntities, formatDate, toPlainText } from "./utils";

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

type MediaResponse = z.infer<typeof MediaSchema>;
type ArticleResponse = z.infer<typeof ArticleSchema>;

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

const POST_CARD_FIELDS =
  "slug,date,title.rendered,excerpt.rendered,categories,authors,featured_media";

const PostCardSchema = z
  .object({
    slug: z.string(),
    date: z.iso.datetime({ local: true }),
    title: z.object({ rendered: z.string() }),
    excerpt: z.object({ rendered: z.string() }),
    categories: z.number().array(),
    authors: z
      .object({
        slug: z.string(),
        display_name: z.string(),
        avatar_url: z
          .union([z.object({ url: z.string() }), z.string(), z.null()])
          .optional(),
      })
      .array(),
    featured_media: z.number(),
  })
  .array();

const MediaListSchema = z
  .object({
    id: z.number(),
    alt_text: z.string().optional(),
    source_url: z.string().optional(),
    media_details: z
      .object({
        sizes: z
          .record(z.string(), z.object({ source_url: z.string() }))
          .optional(),
      })
      .optional(),
  })
  .array();

type MediaEntry = { url: string; alt: string };

/**
 * Sizes WordPress generates, smallest adequate first. Cards top out at 200px
 * tall, so serving `source_url` (the untouched upload) would pull megabytes per
 * card.
 */
const PREFERRED_SIZES = [
  "vantmag-medium",
  "medium_large",
  "vantmag-large",
  "large",
  "medium",
  "full",
];

function pickImageUrl(media: z.infer<typeof MediaListSchema>[number]) {
  const sizes = media.media_details?.sizes;
  if (sizes) {
    for (const size of PREFERRED_SIZES) {
      const found = sizes[size];
      if (found) return found.source_url;
    }
  }
  return media.source_url ?? null;
}

/**
 * Resolves many attachment ids in one request. `_fields` cannot narrow into
 * `media_details.sizes`, so the whole object comes back — still far cheaper
 * than a request per card, and cheaper than the full-size images it avoids.
 */
export async function retrieveMediaMap(
  ids: number[],
): Promise<Record<number, MediaEntry>> {
  const unique = [...new Set(ids.filter((id) => id > 0))];
  if (unique.length === 0) return {};

  const data = await fetch(
    `${BASE_URL}/media?include=${unique.join(",")}&per_page=100&_fields=id,alt_text,source_url,media_details`,
  ).then((res) => res.json());

  const map: Record<number, MediaEntry> = {};
  for (const media of MediaListSchema.parse(data)) {
    const url = pickImageUrl(media);
    if (url) map[media.id] = { url, alt: media.alt_text ?? "" };
  }
  return map;
}

/** Picks the first category the site actually has a chip for. */
function resolveCategory(ids: number[]) {
  return ids.find((id) => categories.some((c) => c.id === id)) ?? null;
}

async function toPostCards(
  raw: z.infer<typeof PostCardSchema>,
): Promise<PostCard[]> {
  const mediaMap = await retrieveMediaMap(raw.map((p) => p.featured_media));

  return raw.map((post) => {
    const media = mediaMap[post.featured_media];
    return {
      slug: post.slug,
      title: decodeEntities(post.title.rendered),
      excerpt: toPlainText(post.excerpt.rendered),
      authors: post.authors.map((a) => ({
        slug: a.slug,
        display_name: a.display_name,
        avatar_url:
          typeof a.avatar_url === "string"
            ? a.avatar_url
            : (a.avatar_url?.url ?? undefined),
      })),
      category: resolveCategory(post.categories),
      pubDate: formatDate(post.date),
      image: media?.url ?? null,
      imageAlt: media?.alt || decodeEntities(post.title.rendered),
    };
  });
}

async function retrievePostCards(query: string): Promise<PostCard[]> {
  const data = await fetch(
    `${BASE_URL}/posts?${query}&_fields=${POST_CARD_FIELDS}`,
  ).then((res) => res.json());

  return toPostCards(PostCardSchema.parse(data));
}

/**
 * Deterministic shuffle. The old theme used PHP `rand()` for its suggestions
 * row; seeding off the slugs keeps the order stable between renders so the row
 * does not reshuffle on every re-render (and stays hydration-safe if SSR is
 * enabled later).
 */
function seededShuffle<T>(items: T[], seed: string) {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (Math.imul(31, hash) + seed.charCodeAt(i)) | 0;
  }

  const shuffled = [...items];
  for (let i = shuffled.length - 1; i > 0; i--) {
    hash = (Math.imul(hash, 1103515245) + 12345) | 0;
    const j = Math.abs(hash) % (i + 1);
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * Hero, latest and suggestions all come from one request. The old site's hero
 * is simply the newest post — there are no sticky posts on the site.
 */
export async function retrieveHomeData(): Promise<HomeData> {
  const posts = await retrievePostCards("per_page=13");

  return {
    hero: posts[0] ?? null,
    latest: posts.slice(1, 7),
    suggestions: seededShuffle(
      posts.slice(1),
      posts.map((p) => p.slug).join(),
    ).slice(0, 6),
  };
}

export async function retrieveCategoryPosts(
  categoryId: number,
  page = 1,
  perPage = 9,
): Promise<PostCard[]> {
  return retrievePostCards(
    `categories=${categoryId}&per_page=${perPage}&page=${page}`,
  );
}
