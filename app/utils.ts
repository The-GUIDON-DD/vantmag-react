import type { ArticleData } from "./types";

export function getSocMedUrlsFromArticle(article: ArticleData) {
  return {
    facebook: `https://www.facebook.com/sharer.php?u=https://vantage.theguidon.com/${article.slug}`,
    twitter: `http://x.com/share?url=https://vantage.theguidon.com/${article.slug}&text=${encodeURIComponent(article.title)}`,
    x: `http://x.com/share?url=https://vantage.theguidon.com/${article.slug}&text=${encodeURIComponent(article.title)}`,
  };
}

const NAMED_ENTITIES: Record<string, string> = {
  amp: "&",
  lt: "<",
  gt: ">",
  quot: '"',
  apos: "'",
  nbsp: " ",
  hellip: "…",
  mdash: "—",
  ndash: "–",
  lsquo: "‘",
  rsquo: "’",
  ldquo: "“",
  rdquo: "”",
};

/**
 * Decodes the HTML entities WordPress leaves in `rendered` strings. Written as a
 * pure function rather than a DOM round-trip so it keeps working if SSR is
 * turned on later.
 */
export function decodeEntities(text: string) {
  return text.replace(/&(#x?[0-9a-f]+|[a-z]+);/gi, (match, code: string) => {
    if (code[0] === "#") {
      const point =
        code[1] === "x" || code[1] === "X"
          ? Number.parseInt(code.slice(2), 16)
          : Number.parseInt(code.slice(1), 10);
      return Number.isNaN(point) ? match : String.fromCodePoint(point);
    }
    return NAMED_ENTITIES[code.toLowerCase()] ?? match;
  });
}

/** Turns a WordPress `rendered` field into plain text for cards. */
export function toPlainText(html: string) {
  return decodeEntities(html.replace(/<[^>]*>/g, "")).trim();
}

export function formatDate(date: string) {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(date));
}

/**
 * Renders a byline the way the theme does: "A", "A and B", "A, B, and C".
 * Plain text — `Bylines` is the linked equivalent used on the article page.
 */
export function formatAuthors(authors: { display_name: string }[]) {
  const names = authors.map((a) => a.display_name);
  if (names.length === 0) return "";
  if (names.length === 1) return names[0];
  if (names.length === 2) return `${names[0]} and ${names[1]}`;
  return `${names.slice(0, -1).join(", ")}, and ${names[names.length - 1]}`;
}
