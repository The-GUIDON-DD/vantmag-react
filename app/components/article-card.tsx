import type { ArticleCardPost } from "../types";
import Chip from "./chip";

type ArticleCardCategory = {
  name: string;
  icon: string;
  color: string;
};

type ArticleCardProps = {
  post: ArticleCardPost;
  category?: ArticleCardCategory;
  variant?: "featured" | "featured-row" | "grid" | "row";
  showExcerpt?: boolean;
  showCategory?: boolean;
};

type ArticleCardClasses = {
  article: string;
  imageLink: string;
  content: string;
  heading: string;
  byline: string;
};

function plainText(html: string) {
  if (typeof DOMParser === "undefined") {
    return html.replace(/<[^>]*>/g, "");
  }

  const document = new DOMParser().parseFromString(html, "text/html");
  return document.body.textContent?.trim() ?? "";
}

function postDate(date: string) {
  const [year, month, day] = date.slice(0, 10).split("-").map(Number);
  return new Intl.DateTimeFormat("en-PH", {
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(Date.UTC(year, month - 1, day)));
}

function PostImage({
  post,
  variant,
}: {
  post: ArticleCardPost;
  variant: NonNullable<ArticleCardProps["variant"]>;
}) {
  const image = post._embedded?.["wp:featuredmedia"]?.[0];
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
      {image?.source_url && (
        <img
          src={image.source_url}
          alt={image.alt_text || ""}
          loading={variant === "featured" ? "eager" : "lazy"}
          className="absolute inset-0 h-full w-full object-cover"
        />
      )}
    </div>
  );
}

function Byline({
  post,
  className = "",
}: {
  post: ArticleCardPost;
  className?: string;
}) {
  // TODO: Use shared Bylines when /author/:slug is routed; it renders author links.
  const authors = post.authors?.map((author) => author.display_name).join(", ");
  return (
    <p
      className={`text-sm uppercase leading-tight text-[#737373] ${className}`}
    >
      {authors && <span className="font-bold lg:block">By {authors}</span>}
      {authors && <span className="lg:hidden"> · </span>}
      <time dateTime={post.date}>{postDate(post.date)}</time>
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

  // TODO: Link to `/${post.slug}` when the in-app article page is ready.
  const articleHref = post.link;

  const title = (
    <a href={articleHref} className="hover:underline">
      {plainText(post.title.rendered)}
    </a>
  );
  const excerpt = showExcerpt && (
    <p
      className={`${variant === "featured" ? "mt-3" : "mt-2"} line-clamp-3 leading-[1.2] ${featured ? "text-base lg:text-sm" : "text-sm"}`}
    >
      {plainText(post.excerpt.rendered)}
    </p>
  );
  const chip = showCategory && category && (
    <div className={`mb-3 ${variant === "grid" ? "lg:mt-4" : ""}`}>
      <Chip title={category.name} icon={category.icon} color={category.color} />
    </div>
  );

  if (featured) {
    let featuredClasses: ArticleCardClasses;

    if (variant === "featured") {
      featuredClasses = {
        article:
          "category-article -m-3 flex flex-col gap-4 rounded-lg p-3 lg:row-span-2 lg:gap-5",
        imageLink: "block overflow-hidden rounded",
        content: "",
        heading: "text-lg font-bold leading-[1.15] lg:text-[32px]",
        byline: "mt-2 lg:mt-7",
      };
    } else {
      // Keep the image at the top if the row text is taller than the image.
      featuredClasses = {
        article:
          "category-article -m-3 flex flex-col gap-5 rounded-lg p-3 lg:flex-row lg:items-center lg:gap-6",
        imageLink:
          "block overflow-hidden rounded lg:w-[52%] lg:shrink-0 lg:self-start xl:w-[40%]",
        content: "min-w-0 flex-1",
        heading: "text-lg font-bold leading-tight",
        byline: "mt-3",
      };
    }

    return (
      <article className={featuredClasses.article}>
        <a href={articleHref} className={featuredClasses.imageLink}>
          <PostImage post={post} variant={variant} />
        </a>
        <div className={featuredClasses.content}>
          {chip}
          <h2 className={featuredClasses.heading}>{title}</h2>
          {excerpt}
          <Byline post={post} className={featuredClasses.byline} />
        </div>
      </article>
    );
  }

  let standardClasses: ArticleCardClasses;

  if (variant === "row") {
    standardClasses = {
      article: "category-article -m-3 flex flex-wrap gap-4 rounded-lg p-3",
      imageLink: "block min-w-0 flex-[1_1_120px] overflow-hidden rounded",
      content: "flex min-w-0 flex-[2_1_200px] flex-col",
      heading: "text-base font-bold leading-tight",
      byline: "mt-auto pt-6",
    };
  } else {
    standardClasses = {
      article:
        "category-article -m-3 grid min-w-0 grid-cols-[minmax(0,20%)_minmax(0,1fr)] gap-4 rounded-lg p-3 lg:flex lg:flex-col lg:gap-0",
      imageLink: "block shrink-0 overflow-hidden rounded",
      content: "flex min-w-0 flex-col lg:flex-1",
      heading: chip
        ? "text-base font-bold leading-tight"
        : "text-base font-bold leading-tight lg:mt-4",
      byline: "mt-4 lg:mt-auto lg:pt-6",
    };
  }

  return (
    <article className={standardClasses.article}>
      <a href={articleHref} className={standardClasses.imageLink}>
        <PostImage post={post} variant={variant} />
      </a>
      <div className={standardClasses.content}>
        {chip}
        <h3 className={standardClasses.heading}>{title}</h3>
        {excerpt}
        <Byline post={post} className={standardClasses.byline} />
      </div>
    </article>
  );
}
