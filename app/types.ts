export const BASE_URL = "https://vantage.theguidon.com/wp-json/wp/v2";

export interface Author {
  slug: string;
  display_name: string;
}

export interface ArticleData {
  id: number;
  title: string;
  slug: string;
  authors?: Author[];
  featured_image: number;
  category: number;
  pubDate: string;
  excerpt: string;
  content: string;
}

export type ArticleCardData = Omit<ArticleData, "content">;

export interface ArticleCardPost {
  id: number;
  date: string;
  link: string;
  slug: string;
  title: { rendered: string };
  excerpt: { rendered: string };
  featured_media: number;
  authors?: Author[];
}

export type CategoryDetails = {
  name: string;
  description: string;
  descriptionColor: string;
};

export interface CategoryPostsPage {
  posts: ArticleCardPost[];
  hasMore: boolean;
}
