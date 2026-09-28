import Chip from "./chip";

export type ArticleCardPost = {
  id: number;
  date: string;
  link: string;
  title: { rendered: string };
  excerpt: { rendered: string };
  authors?: { display_name: string }[];
  _embedded?: {
    "wp:featuredmedia"?: { source_url?: string; alt_text?: string }[];
  };
};

export type ArticleCardCategory = {
  name: string;
  icon: string;
  color: string;
};

export type ArticleCardProps = {
  post: ArticleCardPost;
  category?: ArticleCardCategory;
  variant?: "featured" | "featured-row" | "grid" | "row";
  showExcerpt?: boolean;
  showCategory?: boolean;
};

function plainText(html: string) {
  if (typeof DOMParser === "undefined") return html.replace(/<[^>]*>/g, "");
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
    featured: "aspect-[12/5] lg:aspect-[875/312] xl:aspect-[25/8]",
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
  const authors = post.authors?.map((author) => author.display_name).join(", ");
  return (
    <p
      className={`text-sm uppercase leading-tight text-neutral-600 ${className}`}
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
  const title = (
    <a href={post.link} className="hover:underline">
      {plainText(post.title.rendered)}
    </a>
  );
  const excerpt = showExcerpt && (
    <p className="mt-2 line-clamp-3 text-sm leading-[1.2]">
      {plainText(post.excerpt.rendered)}
    </p>
  );
  const chip = showCategory && category && (
    <div className={`mb-3 ${variant === "grid" ? "lg:mt-4" : ""}`}>
      <Chip title={category.name} icon={category.icon} color={category.color} />
    </div>
  );

  if (featured) {
    const primary = variant === "featured";
    return (
      <article
        className={`category-article -m-3 rounded-lg p-3 ${
          primary
            ? "space-y-4"
            : "flex flex-col gap-5 lg:grid lg:grid-cols-[minmax(0,52%)_minmax(0,1fr)] lg:items-center lg:gap-6 xl:grid-cols-[minmax(0,40%)_minmax(0,1fr)]"
        }`}
      >
        <a href={post.link} className="block overflow-hidden rounded">
          <PostImage post={post} variant={variant} />
        </a>
        <div>
          {chip}
          <h2
            className={
              primary
                ? "text-base font-bold leading-[1.15] lg:text-[32px]"
                : "text-lg font-bold leading-tight"
            }
          >
            {title}
          </h2>
          {excerpt}
          <Byline post={post} className={primary ? "mt-2 lg:mt-6" : "mt-3"} />
        </div>
      </article>
    );
  }

  const row = variant === "row";
  return (
    <article
      className={
        row
          ? "category-article -m-3 flex flex-wrap gap-4 rounded-lg p-3"
          : "category-article -m-3 grid min-w-0 grid-cols-[minmax(0,20%)_minmax(0,1fr)] gap-4 rounded-lg p-3 lg:flex lg:flex-col lg:gap-0"
      }
    >
      <a
        href={post.link}
        className={
          row
            ? "block min-w-0 flex-[1_1_120px] overflow-hidden rounded"
            : "block shrink-0 overflow-hidden rounded"
        }
      >
        <PostImage post={post} variant={variant} />
      </a>
      <div
        className={
          row
            ? "flex min-w-0 flex-[2_1_200px] flex-col"
            : "flex min-w-0 flex-col lg:flex-1"
        }
      >
        {chip}
        <h3
          className={`text-base font-bold leading-tight ${row || chip ? "" : "lg:mt-4"}`}
        >
          {title}
        </h3>
        {excerpt}
        <Byline
          post={post}
          className={row ? "mt-auto pt-6" : "mt-4 lg:mt-auto lg:pt-6"}
        />
      </div>
    </article>
  );
}
