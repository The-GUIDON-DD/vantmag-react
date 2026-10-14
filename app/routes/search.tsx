import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import type { CSSProperties, ReactNode } from "react";
import { CgSearch } from "react-icons/cg";
import { Form, Link, useSearchParams } from "react-router";
import ArticleCard from "~/components/article-card";
import {
  retrieveArticlesFromSearch,
  retrieveFeaturedPosts,
  retrieveTagsFromSearch,
} from "~/fetchers";
import type { ArticleCardData } from "~/types";
import { categories } from "../../constants";

// Match the number of articles in the original search layout.
const PAGE_SIZE = 6;
const FEATURED_COUNT = 3;

export function meta() {
  return [
    { title: "Search - Vantage Magazine" },
    { name: "description", content: "Search Vantage Magazine." },
  ];
}

function SearchField({
  term,
  className = "",
}: {
  term: string;
  className?: string;
}) {
  return (
    <Form
      action="/search"
      role="search"
      className={`flex w-full items-center gap-3 rounded-[32px] bg-[#dddffe]/80 px-6 py-4 ${className}`}
    >
      <CgSearch
        aria-hidden="true"
        className="shrink-0 text-2xl text-vant-purple"
      />
      <input
        // Remount when the URL changes so back/forward updates the input.
        key={term}
        type="text"
        name="s"
        defaultValue={term}
        aria-label="Search"
        placeholder="Search an article, author, or category"
        className="min-w-0 grow border-none bg-transparent text-base leading-6 placeholder:text-[#6a757c] focus:outline-none md:text-xl md:leading-6"
      />
    </Form>
  );
}

function PageHeading({ children }: { children: ReactNode }) {
  return (
    <div className="mb-5 flex items-center gap-3 lg:mb-6">
      <h1 className="min-w-0 font-display text-2xl leading-[1.2] font-bold break-words md:text-4xl lg:text-5xl">
        {children}
      </h1>
      <div className="h-px min-w-8 flex-1 bg-neutral-900" />
    </div>
  );
}

function SectionHeading({ children }: { children: ReactNode }) {
  return (
    <h2 className="mb-2.5 font-display text-xl font-bold md:mb-3 md:text-2xl lg:mb-4 lg:text-[32px]">
      {children}
    </h2>
  );
}

function ArticleGrid({ posts }: { posts: ArticleCardData[] }) {
  return (
    <div className="grid gap-5 md:gap-6 lg:grid-cols-3 lg:gap-8 xl:gap-10">
      {posts.map((post) => {
        const category = Object.values(categories).find(
          ({ id }) => id === post.category,
        );
        const highlightStyle = {
          "--category-article-highlight": `color-mix(in srgb, ${category?.color ?? "#dddffe"} 18%, white)`,
        } as CSSProperties;

        return (
          <div key={post.id} style={highlightStyle}>
            <ArticleCard post={post} category={category} />
          </div>
        );
      })}
    </div>
  );
}

// Mirrors the original site, which shows its "not found" layout when a search
// has no matching articles.
function NoResults({ term }: { term: string }) {
  const { data: featuredPosts } = useQuery({
    queryKey: ["featured-posts"],
    queryFn: () => retrieveFeaturedPosts(FEATURED_COUNT),
    // Keep the same random picks while the user stays on the page.
    staleTime: Number.POSITIVE_INFINITY,
  });

  return (
    <>
      <PageHeading>No results for &ldquo;{term}&rdquo;</PageHeading>
      <p className="mb-10 lg:mb-14">
        We couldn&rsquo;t find any articles matching your search. Check the
        spelling or try different keywords.
      </p>

      <SectionHeading>Try searching for it again:</SectionHeading>
      <SearchField term={term} className="mb-10 lg:mb-14" />

      {!!featuredPosts?.length && (
        <section>
          <SectionHeading>
            Or, take a look at a few featured articles:
          </SectionHeading>
          <ArticleGrid posts={featuredPosts} />
        </section>
      )}
    </>
  );
}

export default function Search() {
  const [searchParams] = useSearchParams();
  const term = searchParams.get("s")?.trim() ?? "";
  const hasQuery = term.length > 0;

  const {
    isPending,
    isError,
    data,
    isFetchNextPageError,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
  } = useInfiniteQuery({
    queryKey: ["search-articles", term],
    initialPageParam: 0,
    queryFn: ({ pageParam }) =>
      retrieveArticlesFromSearch(term, pageParam, PAGE_SIZE),
    getNextPageParam: (lastPage, pages) =>
      lastPage.hasMore
        ? pages.reduce((count, page) => count + page.posts.length, 0)
        : undefined,
    enabled: hasQuery,
  });

  // Tags are supplementary, so a failed request just hides the section.
  const { data: tags } = useQuery({
    queryKey: ["search-tags", term],
    queryFn: () => retrieveTagsFromSearch(term),
    enabled: hasQuery,
  });

  const containerClasses =
    "mx-auto w-full max-w-[1240px] px-4 pt-5 pb-10 font-sans text-black lg:w-[90%] lg:px-5 lg:pt-14 lg:pb-20";

  if (!hasQuery) {
    return (
      <main className={containerClasses}>
        <SearchField term="" className="mb-5 lg:mb-10" />
        <p className="text-lg text-gray-400 lg:text-xl">
          Search for an article, author, or category.
        </p>
      </main>
    );
  }

  const posts = data?.pages.flatMap((page) => page.posts) ?? [];

  if (!isPending && !isError && posts.length === 0) {
    return (
      <main className={containerClasses}>
        <NoResults term={term} />
      </main>
    );
  }

  return (
    <main className={containerClasses}>
      <SearchField term={term} className="mb-5 lg:mb-10" />
      <PageHeading>Search results for &ldquo;{term}&rdquo;</PageHeading>

      {isPending && <p className="text-lg text-gray-400">Searching…</p>}

      {isError && !data && (
        <p role="alert" className="text-lg text-red-700">
          Something went wrong while searching. Please try again.
        </p>
      )}

      {!!tags?.length && posts.length > 0 && (
        <section>
          <SectionHeading>Tags</SectionHeading>
          <div className="mb-8 flex flex-wrap items-center gap-x-3 gap-y-1 text-base font-bold text-vant-purple md:text-lg lg:text-xl">
            {tags.map(({ id, name, slug }, ix) => (
              // Keep each dot with the tag before it so lines never start with one.
              <span key={id} className="flex items-center gap-x-3">
                <Link
                  to={`/tag/${slug}`}
                  className="underline decoration-transparent transition-colors hover:decoration-vant-purple"
                >
                  {name}
                </Link>
                {ix < tags.length - 1 && <span aria-hidden="true">•</span>}
              </span>
            ))}
          </div>
        </section>
      )}

      {posts.length > 0 && (
        <section>
          <SectionHeading>Articles</SectionHeading>
          <ArticleGrid posts={posts} />

          {hasNextPage && (
            <div className="mt-14 text-center">
              <button
                type="button"
                onClick={() => void fetchNextPage()}
                disabled={isFetchingNextPage}
                className="w-full rounded-full bg-[#dddffe] px-10 py-3 text-xs font-bold uppercase text-vant-purple hover:bg-[#cdd0ff] disabled:opacity-60 md:w-auto md:px-16 md:py-2.5 md:text-sm md:leading-[1.2]"
              >
                {isFetchingNextPage ? "Loading…" : "Show me more"}
              </button>
            </div>
          )}
          {isFetchNextPageError && (
            <p role="alert" className="mt-4 text-center text-red-700">
              Could not load more articles. Please try again.
            </p>
          )}
        </section>
      )}
    </main>
  );
}
