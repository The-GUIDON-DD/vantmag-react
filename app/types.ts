export const BASE_URL = "https://vantage.theguidon.com/wp-json/wp/v2";

export interface Author {
  slug: string;
  display_name: string;
  avatar_url?: string;
}

export interface ArticleData {
  title: string;
  slug: string;
  authors: Author[];
  featured_image: number;
  category: number;
  pubDate: string;
  excerpt: string;
  content: string;
}

/** A post as rendered by `ArticleCard` — everything a card needs, flattened. */
export interface PostCard {
  slug: string;
  title: string;
  excerpt: string;
  authors: Author[];
  /** First category id that appears in `constants.ts`, or null. */
  category: number | null;
  pubDate: string;
  image: string | null;
  imageAlt: string;
}

export interface HomeData {
  hero: PostCard | null;
  latest: PostCard[];
  suggestions: PostCard[];
}
