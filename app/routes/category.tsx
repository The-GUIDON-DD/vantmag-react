import { type CSSProperties, Suspense, useRef, useState } from "react";
import { Await } from "react-router";
import { categories } from "../../constants";
import ArticleCard, { type ArticleCardPost } from "../components/article-card";
import { BASE_URL } from "../types";
import type { Route } from "./+types/category";

// Match the number of articles in the original category layout.
const PAGE_SIZE = 9;
const MORE_PAGE_SIZE = 6;

type CategoryDetails = {
  name: string;
  description: string;
  descriptionColor: string;
};

const categoryDetails: Record<string, CategoryDetails> = {
  expose: {
    name: "Exposé",
    description:
      "As persons for and with others, we simply can’t forget what’s happening in the world today.",
    descriptionColor: "#FCF0CD",
  },
  food: {
    name: "Food",
    description:
      "From the bistros of Katipunan to the hole-in-the-wall joints along Maginhawa, there’s something for every foodie on this side of the culinary scene.",
    descriptionColor: "#FEECD3",
  },
  hub: {
    name: "Hub",
    description:
      "Take a glimpse at Ateneo’s vibrant campus culture! In this beat, we focus on the heart of the university—its students.",
    descriptionColor: "#D8F1E9",
  },
  hype: {
    name: "Hype",
    description:
      "We bring you the latest and the greatest trends in pop culture from an Atenean lens.",
    descriptionColor: "#F7D8EC",
  },
  music: {
    name: "Music",
    description:
      "Whether it be a gig at Mow’s Bar or an open mic event at Areté, the Atenean music scene resounds loudly and proudly. Brimming with talent in genres of every kind, there’s something for every music fan.",
    descriptionColor: "#F0F4D6",
  },
  "theater-and-the-arts": {
    name: "Theater & Arts",
    description:
      "Everything from literature and theater to the fine arts; we take you to the stages and pages of the best offerings from artists.",
    descriptionColor: "#E3DDE6",
  },
  "tv-and-film": {
    name: "TV & Film",
    description:
      "From the small screen to the big, we explore the world of film—from the best of Philippine cinema to the international scene.",
    descriptionColor: "#FCD8E0",
  },
};

type PostsPage = {
  posts: ArticleCardPost[];
  hasMore: boolean;
};

// Temporary category-list fetcher. The shared fetchers currently load only
// individual articles and media; move this request there when they support
// paginated category lists with embedded images and a hasMore result.
async function getPosts(
  categoryId: number,
  offset: number,
  pageSize: number,
): Promise<PostsPage> {
  const url = new URL(`${BASE_URL}/posts`);
  url.searchParams.set("categories", String(categoryId));
  url.searchParams.set("orderby", "date");
  url.searchParams.set("order", "desc");
  url.searchParams.set("offset", String(offset));
  url.searchParams.set("per_page", String(pageSize + 1));
  url.searchParams.set("_embed", "1");

  const response = await fetch(url, { cache: "no-store" });
  if (!response.ok) {
    throw new Error(`Could not load articles (${response.status})`);
  }

  const results = (await response.json()) as ArticleCardPost[];
  return {
    posts: results.slice(0, pageSize),
    hasMore: results.length > pageSize,
  };
}

export async function clientLoader({ params }: Route.ClientLoaderArgs) {
  const slug = params.slug ?? "";
  const sharedCategory = categories.find(
    ({ path }) => path === `/category/${slug}`,
  );
  const details = categoryDetails[slug];

  if (!sharedCategory || !details) {
    throw new Response("Category not found", { status: 404 });
  }

  const category = { ...sharedCategory, ...details };

  return {
    slug,
    category,
    postsPage: getPosts(category.id, 0, PAGE_SIZE),
  };
}

clientLoader.hydrate = true as const;

type CategoryData = {
  category: (typeof categories)[number] & CategoryDetails;
  posts: ArticleCardPost[];
  hasMore: boolean;
};

function CategoryContent({ data }: { data: CategoryData }) {
  const [posts, setPosts] = useState(data.posts);
  const [hasMore, setHasMore] = useState(data.hasMore);
  const [loadingMore, setLoadingMore] = useState(false);
  const loadingMoreRef = useRef(false);
  const [loadError, setLoadError] = useState("");
  const featuredPosts = posts.slice(0, 3);
  const remainingPosts = posts.slice(3);

  const highlightStyle = {
    "--category-article-highlight": `color-mix(in srgb, ${data.category.color} 18%, white)`,
  } as CSSProperties;

  async function loadMore() {
    if (!hasMore || loadingMoreRef.current) {
      return;
    }

    loadingMoreRef.current = true;
    setLoadingMore(true);
    setLoadError("");

    try {
      const next = await getPosts(
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
      className="mx-auto w-full max-w-[1240px] px-4 pt-6 pb-20 lg:w-[90%] lg:px-5 lg:pt-10"
      style={highlightStyle}
    >
      {featuredPosts.length > 0 ? (
        <section
          aria-label="Featured articles"
          className="mb-10 grid gap-8 md:mb-12 lg:grid-cols-[5fr_4fr]"
        >
          <ArticleCard
            post={featuredPosts[0]}
            category={data.category}
            variant="featured"
            showCategory={false}
          />
          <div className="grid gap-8 self-start">
            {featuredPosts.slice(1).map((post) => (
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

      {remainingPosts.length > 0 && (
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
          <div className="grid gap-8 lg:grid-cols-3 lg:gap-8">
            {remainingPosts.map((post) => (
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
  if (!loaderData) {
    return <p className="p-8">Loading articles…</p>;
  }

  const { slug, category, postsPage } = loaderData;
  const articleError = (
    <p
      role="alert"
      className="mx-auto w-full max-w-[1240px] px-4 py-12 lg:w-[85%] lg:px-5"
    >
      Could not load articles. Please try again.
    </p>
  );

  return (
    <div className="category-page min-h-screen bg-white font-sans text-black">
      <section
        className="grid lg:grid-cols-[45%_55%] lg:rounded-br-[45px]"
        style={{ backgroundColor: category.descriptionColor }}
      >
        <div
          className="flex items-center justify-center gap-3 rounded-b-[18px] px-8 py-3.5 text-white lg:gap-5 lg:rounded-bl-none lg:rounded-br-[45px] lg:px-12 lg:py-7 xl:gap-6 xl:px-20 xl:py-10"
          style={{ backgroundColor: category.color }}
        >
          <img
            src={category.icon}
            alt=""
            className="h-8 w-8 shrink-0 object-contain lg:h-12 lg:w-12 xl:h-[72px] xl:w-[72px]"
          />
          <h1 className="text-left font-display text-[32px] leading-[1.05] lg:text-5xl xl:text-[72px]">
            {category.name}
          </h1>
        </div>
        <p className="relative z-2 m-0 box-border flex items-center px-6 py-6 text-[20px] font-medium leading-[1.1] lg:py-11 lg:pr-20 lg:pl-16 lg:leading-tight xl:py-[50px] xl:pr-[120px] xl:pl-20">
          {category.description}
        </p>
      </section>
      {/* TODO: Add a category-specific fallback while the first page loads. */}
      <Suspense>
        <Await resolve={postsPage} errorElement={articleError}>
          {(page) => (
            <CategoryContent key={slug} data={{ category, ...page }} />
          )}
        </Await>
      </Suspense>
    </div>
  );
}
