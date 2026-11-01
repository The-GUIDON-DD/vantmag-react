import { categories } from "./constants";
import type { ArticleData } from "./types";

export function categoryFromID(catID: number) {
  if (catID < 0) {
    return categories.other;
  }
  const category = Object.values(categories).find(({ id }) => id === catID);
  if (!category) {
    return categories.other;
  } // temporary: replace with aldrin's other cat
  return category;
}

/*
 * Fallback function for plainText if the DOMParser
 * is not available. Strips all HTML tags from the
 * string.
 * @param {string} html - The raw HTML string.
 */

// self notes for first regex:
// <(script|style)\b[^>]*> just means
// match script/style as a word then match any characters (for attributes) then closing >
export function plainTextFallback(html: string) {
  let result = html
    .replace(/<!--[\s\S]*?-->/g, "") // strips HTML comments
    .replace(/<(script|style)\b[^>]*>[\s\S]*?<\/\1>/gi, ""); // strips text from inside <script> or <style> tags

  // iteratively replace text inside of tags with the text inside
  // This avoids cases like 'New <Meat> World' becoming 'New World'
  let previous: string;
  do {
    previous = result;
    result = result.replace(/<([a-zA-Z0-9-]+)[^>]*>([\s\S]*?)<\/\1>/gi, " $2 ");
  } while (result !== previous);

  // remove spaces before commans and contract spaces
  return result.replace(/\s+,/g, ",").trim().replace(/\s+/g, " ");
}

/*
 * Returns plaintext wrapped inside HTML/an HTML Element.
 * Usually used to strip HTML from rendered titles/excerpts from the
 * WordPress REST API.
 * @param {string} html - The raw HTML string.
 */
export function plainText(html: string) {
  if (typeof DOMParser === "undefined" || !window.DOMParser || !DOMParser) {
    return plainTextFallback(html);
  }

  const document = new DOMParser().parseFromString(html, "text/html");
  return document.body.textContent?.trim() ?? "";
}

export function postDate(date: string) {
  const [year, month, day] = date.slice(0, 10).split("-").map(Number);
  return new Intl.DateTimeFormat("en-PH", {
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(Date.UTC(year, month - 1, day)));
}

export function parseImage(html: string | null) {
  if (!html || typeof DOMParser === "undefined") return null;

  const image = new DOMParser()
    .parseFromString(html, "text/html")
    .querySelector("img");
  const src = image?.getAttribute("src");
  if (!image || !src) return null;

  return {
    src,
    srcSet: image.getAttribute("srcset") || undefined,
    sizes: image.getAttribute("sizes") || undefined,
    alt: image.getAttribute("alt") || "",
    loading:
      image.getAttribute("loading") === "lazy"
        ? ("lazy" as const)
        : ("eager" as const),
  };
}

export function getSocMedUrlsFromArticle(article: ArticleData) {
  return {
    facebook: `https://www.facebook.com/sharer.php?u=https://vantage.theguidon.com/${article.slug}`,
    twitter: `http://x.com/share?url=https://vantage.theguidon.com/${article.slug}&text=${encodeURIComponent(article.title)}`,
    x: `http://x.com/share?url=https://vantage.theguidon.com/${article.slug}&text=${encodeURIComponent(article.title)}`,
  };
}

export function formatDate(date: Date) {
  const formattedDate = new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date);
  return formattedDate;
}
