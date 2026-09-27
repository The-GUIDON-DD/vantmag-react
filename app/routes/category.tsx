import {
  type CSSProperties,
  Suspense,
  useEffect,
  useRef,
  useState,
} from "react";
import { Await } from "react-router";
import type { Route } from "./+types/category";

// sorry for the magic number but this is how many are in the og one
const PAGE_SIZE = 9;
const MORE_PAGE_SIZE = 6;
const POSTS_URL = "https://vantage.theguidon.com/wp-json/wp/v2/posts";
const CACHE_TTL_MS = 60_000;

const categoryIds: Record<string, number> = {
  expose: 244,
  food: 12,
  hub: 242,
  hype: 243,
  music: 4,
  "theater-and-the-arts": 11,
  "tv-and-film": 13,
};

const categories: Record<
  string,
  { id: number; name: string; description: string; icon: string; color: string }
> = {
  expose: {
    id: categoryIds.expose,
    name: "Exposé",
    description:
      "As persons for and with others, we simply can’t forget what’s happening in the world today.",
    icon: "/icons/chip/expose.svg",
    color: "#f6b50b",
  },
  food: {
    id: categoryIds.food,
    name: "Food",
    description:
      "From the bistros of Katipunan to the hole-in-the-wall joints along Maginhawa, there’s something for every foodie on this side of the culinary scene.",
    icon: "/icons/chip/food.svg",
    color: "#f9a524",
  },
  hub: {
    id: categoryIds.hub,
    name: "Hub",
    description:
      "Take a glimpse at Ateneo’s vibrant campus culture! In this beat, we focus on the heart of the university—its students.",
    icon: "/icons/chip/hub.svg",
    color: "#3dbb95",
  },
  hype: {
    id: categoryIds.hype,
    name: "Hype",
    description:
      "We bring you the latest and the greatest trends in pop culture from an Atenean lens.",
    icon: "/icons/chip/hype.svg",
    color: "#d63ba3",
  },
  music: {
    id: categoryIds.music,
    name: "Music",
    description:
      "Whether it be a gig at Mow’s Bar or an open mic event at Areté, the Atenean music scene resounds loudly and proudly.",
    icon: "/icons/chip/music.svg",
    color: "#b5c932",
  },
  "theater-and-the-arts": {
    id: categoryIds["theater-and-the-arts"],
    name: "Theater and the Arts",
    description:
      "Everything from literature and theater to the fine arts; we take you to the stages and pages of the best offerings from artists.",
    icon: "/icons/chip/theater-and-the-arts.svg",
    color: "#755489",
  },
  "tv-and-film": {
    id: categoryIds["tv-and-film"],
    name: "TV & Film",
    description:
      "From the small screen to the big, we explore the world of film—from the best of Philippine cinema to the international scene.",
    icon: "/icons/chip/tv-and-film.svg",
    color: "#ef3e68",
  },
};

// defines the Post based on structure of the WordPress API response
type Post = {
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

type PostsPage = { posts: Post[]; hasMore: boolean };
const cachedPages = new Map<
  string,
  { expiresAt: number; promise: Promise<PostsPage> }
>();

// data cleanup
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

// Share in-flight requests and briefly reuse pages for return visits and Show more.
function getCachedPosts(
  categoryId: number,
  offset: number,
  pageSize: number,
): Promise<PostsPage> {
  const key = `${categoryId}:${offset}:${pageSize}`;
  const cached = cachedPages.get(key);
  if (cached && cached.expiresAt > Date.now()) return cached.promise;

  const promise = getPosts(categoryId, offset, pageSize);
  const entry = { expiresAt: Number.POSITIVE_INFINITY, promise };
  cachedPages.set(key, entry);
  void promise.then(
    () => {
      entry.expiresAt = Date.now() + CACHE_TTL_MS;
    },
    () => {
      if (cachedPages.get(key) === entry) cachedPages.delete(key);
    },
  );
  return promise;
}

// fetches posts per category based on requested page number
async function getPosts(
  categoryId: number,
  offset: number,
  pageSize: number,
): Promise<PostsPage> {
  const url = new URL(POSTS_URL);
  url.searchParams.set("categories", String(categoryId));
  url.searchParams.set("orderby", "date");
  url.searchParams.set("order", "desc");
  url.searchParams.set("offset", String(offset));
  url.searchParams.set("per_page", String(pageSize + 1));
  url.searchParams.set("_embed", "1");

  const response = await fetch(url);
  if (!response.ok)
    throw new Error(`Could not load articles (${response.status})`);

  const results = (await response.json()) as Post[];
  return {
    posts: results.slice(0, pageSize),
    hasMore: results.length > pageSize,
  };
}

export async function clientLoader({ params }: Route.ClientLoaderArgs) {
  const slug = params.slug ?? "";
  const category = categories[slug];
  if (!category) throw new Response("Category not found", { status: 404 });

  return {
    slug,
    category,
    postsPage: getCachedPosts(category.id, 0, PAGE_SIZE),
  };
}

clientLoader.hydrate = true as const;

// define size of the image based on post type and will put placeholder for when no image is available
function PostImage({
  post,
  variant,
}: {
  post: Post;
  variant: "primary" | "secondary" | "grid";
}) {
  const image = post._embedded?.["wp:featuredmedia"]?.[0];
  const shape = {
    primary: "aspect-[14/5]",
    secondary: "aspect-square",
    grid: "aspect-[8/5]",
  }[variant];

  if (!image?.source_url)
    return <div className={`${shape} rounded bg-slate-100`} />;

  return (
    <img
      src={image.source_url}
      alt={image.alt_text || ""}
      loading={variant === "primary" ? "eager" : "lazy"}
      className={`${shape} w-full rounded object-cover`}
    />
  );
}

// show author and date of post
function Byline({ post, className = "" }: { post: Post; className?: string }) {
  const authors = post.authors?.map((author) => author.display_name).join(", ");
  return (
    <p
      className={`text-sm uppercase leading-tight text-neutral-600 ${className}`}
    >
      {authors && <span className="block font-bold">By {authors}</span>}
      <time dateTime={post.date}>{postDate(post.date)}</time>
    </p>
  );
}

// displays a featured post with a primary or secondary layout
function FeaturedPost({
  post,
  primary = false,
}: {
  post: Post;
  primary?: boolean;
}) {
  return (
    <article
      className={`category-article -m-3 rounded-lg p-3 ${
        primary
          ? "space-y-4"
          : "grid grid-cols-[minmax(0,44.6%)_minmax(0,1fr)] gap-6"
      }`}
    >
      <a href={post.link} className="block overflow-hidden rounded">
        <PostImage post={post} variant={primary ? "primary" : "secondary"} />
      </a>
      <div>
        <h2
          className={
            primary
              ? "text-[32px] font-bold leading-[1.15]"
              : "text-lg font-bold leading-tight"
          }
        >
          <a href={post.link} className="hover:underline">
            {plainText(post.title.rendered)}
          </a>
        </h2>
        <p className="mt-2 line-clamp-3 text-sm leading-[1.2]">
          {plainText(post.excerpt.rendered)}
        </p>
        <Byline post={post} className={primary ? "mt-6" : "mt-3"} />
      </div>
    </article>
  );
}

// for the all artilces grid
function ArticleCard({ post }: { post: Post }) {
  return (
    <article className="category-article -m-3 flex h-full flex-col rounded-lg p-3">
      <a href={post.link} className="block overflow-hidden rounded">
        <PostImage post={post} variant="grid" />
      </a>
      <h3 className="mt-4 text-base font-bold leading-tight">
        <a href={post.link} className="hover:underline">
          {plainText(post.title.rendered)}
        </a>
      </h3>
      <p className="mt-2 line-clamp-3 text-sm leading-[1.2]">
        {plainText(post.excerpt.rendered)}
      </p>
      <Byline post={post} className="mt-auto pt-6" />
    </article>
  );
}

type CategoryData = {
  category: (typeof categories)[string];
  posts: Post[];
  hasMore: boolean;
};

function CategoryContent({ data }: { data: CategoryData }) {
  const [posts, setPosts] = useState(data.posts);
  const [hasMore, setHasMore] = useState(data.hasMore);
  const [loadingMore, setLoadingMore] = useState(false);
  const loadingMoreRef = useRef(false);
  const [loadError, setLoadError] = useState("");
  const featured = posts.slice(0, 3);
  const remaining = posts.slice(3);

  useEffect(() => {
    if (hasMore) {
      void getCachedPosts(data.category.id, posts.length, MORE_PAGE_SIZE).catch(
        () => {},
      );
    }
  }, [data.category.id, posts.length, hasMore]);

  async function loadMore() {
    if (loadingMoreRef.current || !hasMore) return;
    loadingMoreRef.current = true;
    setLoadingMore(true);
    setLoadError("");
    try {
      const next = await getCachedPosts(
        data.category.id,
        posts.length,
        MORE_PAGE_SIZE,
      );
      setPosts((current) => [...current, ...next.posts]);
      setHasMore(next.hasMore);
    } catch {
      setLoadError("Could not load more articles. Please try again.");
    } finally {
      loadingMoreRef.current = false;
      setLoadingMore(false);
    }
  }

  return (
    <div
      className="mx-auto w-full max-w-[1080px] px-5 pt-12 pb-20"
      style={
        {
          "--category-article-highlight": `color-mix(in srgb, ${data.category.color} 18%, white)`,
        } as CSSProperties
      }
    >
      {featured.length > 0 ? (
        <section
          aria-label="Featured articles"
          className="mb-[72px] grid gap-8 lg:grid-cols-[5fr_4fr]"
        >
          <FeaturedPost post={featured[0]} primary />
          <div className="grid gap-8 self-start">
            {featured.slice(1).map((post) => (
              <FeaturedPost key={post.id} post={post} />
            ))}
          </div>
        </section>
      ) : (
        <p>No articles in this category yet.</p>
      )}

      {remaining.length > 0 && (
        <section aria-labelledby="all-articles-heading">
          <div className="mb-6 flex items-center gap-3">
            <h2
              id="all-articles-heading"
              className="shrink-0 font-serif text-4xl font-bold md:text-5xl"
            >
              All Articles
            </h2>
            <div className="h-px flex-1 bg-neutral-900" />
          </div>
          <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
            {remaining.map((post) => (
              <ArticleCard key={post.id} post={post} />
            ))}
          </div>
        </section>
      )}

      {hasMore && (
        <div className="mt-14 text-center">
          <button
            type="button"
            onClick={loadMore}
            disabled={loadingMore}
            className="rounded-full bg-[#dddffe] px-16 py-2.5 text-sm font-bold uppercase text-vant-purple hover:bg-[#cdd0ff] disabled:opacity-60"
          >
            {loadingMore ? "Loading…" : "Show me more"}
          </button>
        </div>
      )}
      {loadError && (
        <p role="alert" className="mt-4 text-center text-red-700">
          {loadError}
        </p>
      )}
    </div>
  );
}

export default function Category({ loaderData }: Route.ComponentProps) {
  if (!loaderData) return <p className="p-8">Loading articles…</p>;

  const { slug, category, postsPage } = loaderData;
  return (
    // keeping this while we don't have a dark mode design for the category page (if ever)
    <div className="min-h-screen bg-white text-black">
      <section
        className="grid md:grid-cols-[45%_55%]"
        style={{
          backgroundColor: `color-mix(in srgb, ${category.color} 20%, white)`,
        }}
      >
        <div
          className="flex items-center justify-center gap-6 rounded-br-3xl px-8 py-10 text-white md:px-12 xl:px-20"
          style={{ backgroundColor: category.color }}
        >
          <img
            src={category.icon}
            alt=""
            className="h-16 w-16 shrink-0 object-contain xl:h-[72px] xl:w-[72px]"
          />
          <h1 className="text-center font-serif text-5xl font-bold leading-[1.05] md:text-6xl xl:text-[72px]">
            {category.name}
          </h1>
        </div>
        <p className="flex items-center px-8 py-8 text-lg font-medium leading-tight md:px-12 md:py-14 xl:px-20 xl:text-xl">
          {category.description}
        </p>
      </section>
      <Suspense
        fallback={
          <p className="mx-auto max-w-[1080px] px-5 py-12">Loading articles…</p>
        }
      >
        <Await
          resolve={postsPage}
          errorElement={
            <p role="alert" className="mx-auto max-w-[1080px] px-5 py-12">
              Could not load articles. Please try again.
            </p>
          }
        >
          {(page) => (
            <CategoryContent key={slug} data={{ category, ...page }} />
          )}
        </Await>
      </Suspense>
    </div>
  );
}
