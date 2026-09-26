import { z } from "zod";
import { type ArticleData, BASE_URL } from "./types";

const ArticleSchema = z.object({
  title: z.string(),
  slug: z.string(),
  authors: z.object({ slug: z.string(), display_name: z.string() }).array(),
  categories: z.number().array(),
  featured_media: z.number(),
  date: z.iso.datetime(),
  excerpt: z.object({ rendered: z.string() }),
  content: z.object({ rendered: z.string() }),
});

type ArticleResponse = z.infer<typeof ArticleSchema>;

// TODO: unit tests for this
export async function retrieveArticleFromSlug(
  slug: string,
): Promise<ArticleData> {
  const data = await fetch(
    `${BASE_URL}/posts?slug=${slug}&_fields=slug,date,title.rendered,content.rendered,excerpt.rendered,categories,authors.slug,authors.display_name,featured_media`,
  ).then((res) => res.json());

  const parsedData: ArticleResponse = ArticleSchema.parse(data);

  return {
    title: parsedData.title,
    slug: slug,
    authors: parsedData.authors,
    featured_image: "",
    category: parsedData.categories[0],
    pubDate: parsedData.date,
    excerpt: parsedData.excerpt.rendered,
    content: parsedData.content.rendered,
  };
}
