export const BASE_URL = "https://vantage.theguidon.com/wp-json/wp/v2";

export interface Author {
  slug: string;
  display_name: string;
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
