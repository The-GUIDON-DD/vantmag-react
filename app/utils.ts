import type { ArticleData, Author } from "./types";

export function getSocMedUrlsFromArticle(article: ArticleData) {
  return {
    facebook: `https://www.facebook.com/sharer.php?u=https://vantage.theguidon.com/${article.slug}`,
    twitter: `http://x.com/share?url=https://vantage.theguidon.com/${article.slug}&text=${encodeURIComponent(article.title)}`,
    x: `http://x.com/share?url=https://vantage.theguidon.com/${article.slug}&text=${encodeURIComponent(article.title)}`,
  };
}

export function getBylinesFromAuthors(authors: Author[]) {
  if (authors.length === 0) {
    return null;
  }
}
