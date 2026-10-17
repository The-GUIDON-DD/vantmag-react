import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Link } from "react-router";
import { categories, page_size_values } from "../../constants";
import { retrieveCategoryPosts } from "../fetchers";
import ArticleCard from "./article-card";

/**
 * The tabs run in a different order from the header nav on the original site,
 * so the order is declared here rather than taken from `constants.ts`.
 */
const TAB_ORDER = [
  "tv-and-film",
  "music",
  "food",
  "theater-and-the-arts",
  "hype",
  "hub",
  "expose",
];

const tabs = TAB_ORDER.map((slug) => categories[slug]).filter(
  (category) => category !== undefined,
);

export default function CategoryTabs() {
  const [active, setActive] = useState(tabs[0]);

  const { data, isPending, isError } = useQuery({
    queryKey: ["category-posts", active.id],
    queryFn: () =>
      retrieveCategoryPosts(active.id, 0, page_size_values.PAGE_SIZE),
  });

  return (
    <section
      className="mb-20"
      style={
        {
          "--category-article-highlight": `color-mix(in srgb, ${active.color} 18%, white)`,
        } as React.CSSProperties
      }
    >
      <div className="tab-selection">
        {tabs.map((category) => (
          <button
            key={category.id}
            type="button"
            onClick={() => setActive(category)}
            className={category.id === active.id ? "active" : undefined}
            style={{ "--active-color": category.color } as React.CSSProperties}
          >
            <span
              className="tab-icon"
              style={{
                // The PNG chips mask cleanly; the SVGs carry their own fills.
                maskImage: `url(${category.icon.replace(".svg", ".png")})`,
                WebkitMaskImage: `url(${category.icon.replace(".svg", ".png")})`,
              }}
            />
            {category.title}
          </button>
        ))}
      </div>

      {isError ? (
        <p className="text-gray-500">Could not load {active.title} articles.</p>
      ) : isPending ? (
        <p className="mb-10 text-gray-500">Loading articles...</p>
      ) : (
        <div className="mb-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {data.posts.map((post) => (
            <ArticleCard
              key={post.id}
              post={post}
              category={active}
              variant="grid"
              showCategory={false}
            />
          ))}
        </div>
      )}

      {/* The original site links through to the category archive here rather
          than paginating in place. */}
      <Link to={active.path} className="load-more">
        Show me more
      </Link>
    </section>
  );
}
