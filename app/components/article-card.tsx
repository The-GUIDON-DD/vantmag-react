import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Link } from "react-router";
import { retrieveMediaFromID } from "../fetchers";
import type { ArticleCardData, CategoryDetails } from "../types";
import { parseImage, plainText, postDate } from "../utils";
import Bylines from "./bylines";
import Chip from "./chip";

// based on where current site grabs image if none is included
const FALLBACK_IMAGE_URL =
  "https://vantage.theguidon.com/wp-content/themes/vantmag-revamp-2022/assets/images/vantmag_16x9.png";

type ArticleCardProps = {
  post: ArticleCardData;
  category?: CategoryDetails;
  variant?: "featured" | "featured-row" | "grid" | "row";
  showExcerpt?: boolean;
  showCategory?: boolean;
};

type ArticleCardClasses = {
  article: string;
  imageContainer: string;
  content: string;
  heading: string;
  byline: string;
};

function PostImage({
  post,
  variant,
}: {
  post: ArticleCardData;
  variant: NonNullable<ArticleCardProps["variant"]>;
}) {
  const hasMedia = post.featured_media > 0;
  const { data: image, isPending } = useQuery({
    queryKey: ["rendered", post.featured_media],
    queryFn: () => retrieveMediaFromID(post.featured_media),
    enabled: hasMedia,
    select: parseImage,
    retry: false,
    retryOnMount: false,
  });
  const [failedSource, setFailedSource] = useState<string | null>(null);
  const displayedImage = image && image.src !== failedSource ? image : null;
  const loading =
    displayedImage?.loading ?? (variant === "featured" ? "eager" : "lazy");
  // Match the wide image's height to the adjacent featured-row image on desktop.
  const shape = {
    featured: "aspect-[16/5] lg:aspect-[875/312] xl:aspect-[25/8]",
    "featured-row": "aspect-[16/5] lg:aspect-[7/6] xl:aspect-square",
    grid: "aspect-square lg:aspect-[11/6]",
    row: "aspect-[11/6]",
  }[variant];

  return (
    <div
      className={`relative w-full overflow-hidden rounded bg-slate-100 ${shape}`}
    >
      {(!hasMedia || !isPending) && (
        <img
          src={displayedImage?.src || FALLBACK_IMAGE_URL}
          srcSet={displayedImage?.srcSet}
          sizes={displayedImage?.sizes}
          alt={displayedImage?.alt || ""}
          loading={loading}
          onError={() => {
            if (displayedImage) setFailedSource(displayedImage.src);
          }}
          className="absolute inset-0 h-full w-full object-cover"
        />
      )}
    </div>
  );
}

function CardMetadata({
  post,
  className = "",
  compact = false,
}: {
  post: ArticleCardData;
  className?: string;
  compact?: boolean;
}) {
  const authors = post.authors ?? [];
  const hasAuthors = authors.length > 0;
  return (
    <p
      className={`${compact ? "text-xs lg:text-sm" : "text-sm"} uppercase leading-tight text-[#737373] ${className}`}
    >
      {hasAuthors && (
        <span className="font-bold lg:block [&_a]:relative [&_a]:z-2">
          By <Bylines authors={authors} />
        </span>
      )}
      {hasAuthors && <span className="lg:hidden"> · </span>}
      <time dateTime={post.pubDate}>{post.pubDate}</time>
    </p>
  );
}

export default function ArticleCard({
  post,
  category,
  variant = "grid",
  showExcerpt = true,
  showCategory = true,
}: ArticleCardProps) {
  const featured = variant === "featured" || variant === "featured-row";

  const articleHref = `/${post.slug}`;

  const title = plainText(post.title);
  const excerpt = showExcerpt && (
    <p
      className={`${variant === "featured" ? "mt-3" : variant === "grid" ? "mt-1 lg:mt-2" : "mt-2"} ${variant === "grid" ? "line-clamp-2 lg:line-clamp-3" : "line-clamp-3"} leading-[1.2] ${featured ? "text-base lg:text-sm" : "text-sm"}`}
    >
      {plainText(post.excerpt)}
    </p>
  );
  const chip = showCategory && category && (
    <div className={`mb-3 ${variant === "grid" ? "lg:mt-4" : ""}`}>
      <Chip
        title={category.title}
        icon={category.icon}
        color={category.color}
      />
    </div>
  );

  if (featured) {
    let featuredClasses: ArticleCardClasses;

    if (variant === "featured") {
      featuredClasses = {
        article:
          "category-article -m-3 flex flex-col gap-4 rounded-lg p-3 lg:gap-5",
        imageContainer: "block shrink-0 overflow-hidden rounded",
        content: "flex flex-1 flex-col",
        heading: "text-lg font-bold leading-[1.15] lg:text-[32px]",
        byline: "mt-auto pt-2 lg:pt-7",
      };
    } else {
      // Keep the image at the top if the row text is taller than the image.
      featuredClasses = {
        article:
          "category-article -m-3 flex flex-col gap-5 rounded-lg p-3 lg:flex-row lg:items-center lg:gap-6",
        imageContainer:
          "block overflow-hidden rounded lg:w-[52%] lg:shrink-0 lg:self-start xl:w-[40%]",
        content: "min-w-0 flex-1",
        heading: "text-lg font-bold leading-tight",
        byline: "mt-3",
      };
    }

    return (
      <article className={featuredClasses.article}>
        <div className={featuredClasses.imageContainer}>
          <PostImage post={post} variant={variant} />
        </div>
        <div className={featuredClasses.content}>
          {chip}
          <h2 className={featuredClasses.heading}>
            <Link to={articleHref} className="category-article-link">
              {title}
            </Link>
          </h2>
          {excerpt}
          <CardMetadata post={post} className={featuredClasses.byline} />
        </div>
      </article>
    );
  }

  let standardClasses: ArticleCardClasses;

  if (variant === "row") {
    standardClasses = {
      article: "category-article -m-3 flex flex-wrap gap-4 rounded-lg p-3",
      imageContainer: "block min-w-0 flex-[1_1_120px] overflow-hidden rounded",
      content: "flex min-w-0 flex-[2_1_200px] flex-col",
      heading: "text-base font-bold leading-tight",
      byline: "mt-auto pt-6",
    };
  } else {
    standardClasses = {
      article:
        "category-article -m-3 grid min-w-0 grid-cols-[100px_minmax(0,1fr)] gap-4 rounded-lg p-3 lg:flex lg:flex-col lg:gap-0",
      imageContainer: "block shrink-0 overflow-hidden rounded",
      content: "flex min-w-0 flex-col lg:flex-1",
      heading: chip
        ? "text-base font-bold leading-tight"
        : "text-base font-bold leading-tight lg:mt-4",
      byline: "mt-auto pt-1 lg:pt-6",
    };
  }

  return (
    <article className={standardClasses.article}>
      <div className={standardClasses.imageContainer}>
        <PostImage post={post} variant={variant} />
      </div>
      <div className={standardClasses.content}>
        {chip}
        <h3 className={standardClasses.heading}>
          <Link to={articleHref} className="category-article-link">
            {title}
          </Link>
        </h3>
        {excerpt}
        <CardMetadata
          post={post}
          className={standardClasses.byline}
          compact={variant === "grid"}
        />
      </div>
    </article>
  );
}
