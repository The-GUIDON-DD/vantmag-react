import { useInfiniteQuery } from "@tanstack/react-query";
import type { CSSProperties } from "react";
import type { CategoryDetails } from "~/types";
import { categories, page_size_values } from "../../constants";
import ArticleCard from "../components/article-card";
import { retrieveCategoryPosts } from "../fetchers";
import type { Route } from "./+types/category";

function CategoryContent({ category }: { category: CategoryDetails }) {
  const {
    data,
    isPending,
    isError,
    isFetchNextPageError,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
  } = useInfiniteQuery({
    queryKey: ["category-posts", category.id],
    initialPageParam: 0,
    queryFn: ({ pageParam }) =>
      retrieveCategoryPosts(
        category.id,
        pageParam,
        pageParam === 0
          ? page_size_values.PAGE_SIZE
          : page_size_values.MORE_PAGE_SIZE,
      ),
    getNextPageParam: (lastPage, pages) =>
      lastPage.hasMore
        ? pages.reduce((count, page) => count + page.posts.length, 0)
        : undefined,
  });

  if (isPending) {
    return <p className="p-8">Loading articles...</p>;
  }

  if (isError && !data) {
    return (
      <p
        role="alert"
        className="mx-auto w-full max-w-[1240px] px-4 py-12 lg:w-[85%] lg:px-5"
      >
        Could not load articles. Please try again.
      </p>
    );
  }

  const posts = data.pages.flatMap((page) => page.posts);
  const featuredPosts = posts.slice(0, 3);
  const remainingPosts = posts.slice(3);

  const highlightStyle = {
    "--category-article-highlight": `color-mix(in srgb, ${category.color} 18%, white)`,
  } as CSSProperties;

  return (
    <div
      className="mx-auto w-full max-w-[1240px] px-4 pt-6 pb-20 lg:w-[90%] lg:px-5 lg:pt-10"
      style={highlightStyle}
    >
      {featuredPosts.length > 0 ? (
        <section
          aria-label="Featured articles"
          className="mb-10 grid gap-6 md:mb-12 lg:grid-cols-[5fr_4fr]"
        >
          <ArticleCard
            post={featuredPosts[0]}
            category={category}
            variant="featured"
            showCategory={false}
          />
          <div className="grid gap-6">
            {featuredPosts.slice(1).map((post) => (
              <ArticleCard
                key={post.id}
                post={post}
                category={category}
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
          <div className="mb-5 flex items-center gap-3 lg:mb-6">
            <h2
              id="all-articles-heading"
              className="shrink-0 font-display text-2xl font-bold md:text-4xl lg:text-5xl"
            >
              All Articles
            </h2>
            <div className="h-px flex-1 bg-neutral-900 lg:bg-neutral-400" />
          </div>
          <div className="grid gap-5 lg:grid-cols-3 lg:gap-8">
            {remainingPosts.map((post) => (
              <ArticleCard
                key={post.id}
                post={post}
                category={category}
                showCategory={false}
              />
            ))}
          </div>
        </section>
      )}

      {hasNextPage && (
        <div className="mt-14 text-center">
          <button
            type="button"
            onClick={() => void fetchNextPage()}
            disabled={isFetchingNextPage}
            className="rounded-full bg-[#dddffe] px-16 py-2.5 text-sm font-bold uppercase text-vant-purple hover:bg-[#cdd0ff] disabled:opacity-60"
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
    </div>
  );
}

export default function Category({ params }: Route.ComponentProps) {
  const slug = params.slug ?? "";
  const category = categories[slug];

  if (!(slug in categories) || !category) {
    throw new Response("Category not found", { status: 404 });
  }

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
            {category.title}
          </h1>
        </div>
        <p className="relative z-2 m-0 box-border flex items-center px-6 py-6 text-[20px] font-medium leading-[1.1] lg:py-11 lg:pr-20 lg:pl-16 lg:leading-tight xl:py-[50px] xl:pr-[120px] xl:pl-20">
          {category.description}
        </p>
      </section>
      <CategoryContent key={slug} category={category} />
    </div>
  );
}
