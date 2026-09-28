import { useInfiniteQuery } from "@tanstack/react-query";
import { useState } from "react";
import { categories } from "../../constants";
import { retrieveCategoryPosts } from "../fetchers";
import ArticleCard from "./article-card";

const PER_PAGE = 9;

export default function CategoryTabs() {
  const [active, setActive] = useState(categories[0]);

  const {
    data,
    isPending,
    isError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ["category-posts", active.id],
    queryFn: ({ pageParam }) =>
      retrieveCategoryPosts(active.id, pageParam, PER_PAGE),
    initialPageParam: 1,
    // WordPress returns a short page when it runs out of posts.
    getNextPageParam: (lastPage, allPages) =>
      lastPage.length < PER_PAGE ? undefined : allPages.length + 1,
  });

  const posts = data?.pages.flat() ?? [];

  return (
    <section className="mb-20">
      <div className="tab-selection">
        {categories.map((category) => {
          const isActive = category.id === active.id;
          return (
            <button
              key={category.id}
              type="button"
              onClick={() => setActive(category)}
              className={isActive ? "active" : undefined}
              style={
                { "--active-color": category.color } as React.CSSProperties
              }
            >
              <span
                className="tab-icon"
                style={{
                  maskImage: `url(${category.icon})`,
                  WebkitMaskImage: `url(${category.icon})`,
                }}
              />
              {category.title}
            </button>
          );
        })}
      </div>

      {isError ? (
        <p className="text-gray-500">Could not load {active.title} articles.</p>
      ) : isPending ? (
        <div className="articles-grid mb-10">
          {Array.from({ length: PER_PAGE }, (_, i) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: fixed-length skeleton
            <div key={i} className="loading-anim h-50 rounded" />
          ))}
        </div>
      ) : (
        <div className="articles-grid mb-10">
          {posts.map((post) => (
            <ArticleCard key={post.slug} post={post} />
          ))}
        </div>
      )}

      {hasNextPage && (
        <button
          type="button"
          className="load-more"
          disabled={isFetchingNextPage}
          onClick={() => fetchNextPage()}
        >
          {isFetchingNextPage ? "Loading..." : "Load more"}
        </button>
      )}
    </section>
  );
}
