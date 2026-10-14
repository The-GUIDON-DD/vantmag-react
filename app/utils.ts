import type { ArticleData } from "./types";

export function plainText(html: string) {
  if (typeof DOMParser === "undefined") {
    return html.replace(/<[^>]*>/g, "");
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
