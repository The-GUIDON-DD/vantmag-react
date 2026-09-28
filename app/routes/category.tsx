import {
  type CSSProperties,
  Suspense,
  useEffect,
  useRef,
  useState,
} from "react";
import { Await } from "react-router";
import ArticleCard, { type ArticleCardPost } from "../components/article-card";
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
  {
    id: number;
    name: string;
    description: string;
    icon: string;
    color: string;
    descriptionColor: string;
  }
> = {
  expose: {
    id: categoryIds.expose,
    name: "Exposé",
    description:
      "As persons for and with others, we simply can’t forget what’s happening in the world today.",
    icon: "/icons/chip/expose.svg",
    color: "#F6B40B",
    descriptionColor: "#FCF0CD",
  },
  food: {
    id: categoryIds.food,
    name: "Food",
    description:
      "From the bistros of Katipunan to the hole-in-the-wall joints along Maginhawa, there’s something for every foodie on this side of the culinary scene.",
    icon: "/icons/chip/food.svg",
    color: "#F9A523",
    descriptionColor: "#FEECD3",
  },
  hub: {
    id: categoryIds.hub,
    name: "Hub",
    description:
      "Take a glimpse at Ateneo’s vibrant campus culture! In this beat, we focus on the heart of the university—its students.",
    icon: "/icons/chip/hub.svg",
    color: "#3DBB95",
    descriptionColor: "#D8F1E9",
  },
  hype: {
    id: categoryIds.hype,
    name: "Hype",
    description:
      "We bring you the latest and the greatest trends in pop culture from an Atenean lens.",
    icon: "/icons/chip/hype.svg",
    color: "#D63AA2",
    descriptionColor: "#F7D8EC",
  },
  music: {
    id: categoryIds.music,
    name: "Music",
    description:
      "Whether it be a gig at Mow’s Bar or an open mic event at Areté, the Atenean music scene resounds loudly and proudly. Brimming with talent in genres of every kind, there’s something for every music fan.",
    icon: "/icons/chip/music.svg",
    color: "#B5C832",
    descriptionColor: "#F0F4D6",
  },
  "theater-and-the-arts": {
    id: categoryIds["theater-and-the-arts"],
    name: "Theater and the Arts",
    description:
      "Everything from literature and theater to the fine arts; we take you to the stages and pages of the best offerings from artists.",
    icon: "/icons/chip/theater-and-the-arts.svg",
    color: "#745488",
    descriptionColor: "#E3DDE6",
  },
  "tv-and-film": {
    id: categoryIds["tv-and-film"],
    name: "TV & Film",
    description:
      "From the small screen to the big, we explore the world of film—from the best of Philippine cinema to the international scene.",
    icon: "/icons/chip/tv-and-film.svg",
    color: "#EE3E68",
    descriptionColor: "#FCD8E0",
  },
};

type PostsPage = { posts: ArticleCardPost[]; hasMore: boolean };
const cachedPages = new Map<
  string,
  { expiresAt: number; promise: Promise<PostsPage> }
>();

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

  const results = (await response.json()) as ArticleCardPost[];
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

type CategoryData = {
  category: (typeof categories)[string];
  posts: ArticleCardPost[];
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
      className="mx-auto w-full max-w-[1240px] px-4 pt-6 pb-20 lg:w-[85%] lg:px-5 lg:pt-10"
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
          <ArticleCard
            post={featured[0]}
            category={data.category}
            variant="featured"
            showCategory={false}
          />
          <div className="grid gap-8 self-start">
            {featured.slice(1).map((post) => (
              <ArticleCard
                key={post.id}
                post={post}
                category={data.category}
                variant="featured-row"
                showCategory={false}
              />
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
              className="shrink-0 font-display text-[28px] font-bold md:text-4xl lg:text-5xl"
            >
              All Articles
            </h2>
            <div className="h-px flex-1 bg-neutral-900 lg:bg-neutral-400" />
          </div>
          <div className="grid gap-8 lg:grid-cols-3 lg:gap-10">
            {remaining.map((post) => (
              <ArticleCard
                key={post.id}
                post={post}
                category={data.category}
                showCategory={false}
              />
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
    <div className="category-page min-h-screen bg-white font-sans text-black">
      <section
        className="grid rounded-br-[45px] lg:grid-cols-[45%_55%]"
        style={{ backgroundColor: category.descriptionColor }}
      >
        <div
          className="flex items-center justify-center gap-3 rounded-b-[18px] px-8 py-3.5 text-white lg:gap-6 lg:rounded-bl-none lg:rounded-br-[45px] lg:px-12 lg:py-10 xl:px-20"
          style={{ backgroundColor: category.color }}
        >
          <img
            src={category.icon}
            alt=""
            className="h-8 w-8 shrink-0 object-contain lg:h-16 lg:w-16 xl:h-[72px] xl:w-[72px]"
          />
          <h1 className="text-center font-display text-[32px] leading-[1.05] lg:text-6xl xl:text-[72px]">
            {category.name}
          </h1>
        </div>
        <p className="relative z-2 m-0 box-border flex items-center px-6 py-6 text-[20px] font-medium leading-[1.1] lg:py-[50px] lg:pr-[120px] lg:pl-20 lg:leading-tight">
          {category.description}
        </p>
      </section>
      <Suspense>
        <Await
          resolve={postsPage}
          errorElement={
            <p
              role="alert"
              className="mx-auto w-full max-w-[1240px] px-4 py-12 lg:w-[85%] lg:px-5"
            >
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
