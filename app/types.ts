export const BASE_URL = "https://vantage.theguidon.com/wp-json/wp/v2";

export interface Author {
  slug: string;
  display_name: string;
}

export interface ArticleCardData {
  title: string;
  slug: string;
  authors: Author[];
  featured_image: number;
  thumbnail?: string;
  category: number;
  pubDate: string;
  excerpt: string;
}

export interface ArticleData extends ArticleCardData {
  content: string;
}

export interface ArticleSearchResults {
  articles: ArticleCardData[];
  totalPages: number;
}

export interface AuthorResult {
  id: number;
  slug: string;
  name: string;
}
