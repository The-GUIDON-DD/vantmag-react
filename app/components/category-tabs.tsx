import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Link } from "react-router";
import { categories } from "../../constants";
import { retrieveCategoryPosts } from "../fetchers";
import ArticleCard from "./article-card";

const PER_PAGE = 9;

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

const tabs = TAB_ORDER.map((slug) =>
  categories.find((c) => c.path.endsWith(slug)),
).filter((c) => c !== undefined);

export default function CategoryTabs() {
  const [active, setActive] = useState(tabs[0]);

  const { data, isPending, isError } = useQuery({
    queryKey: ["category-posts", active.id],
    queryFn: () => retrieveCategoryPosts(active.id, 1, PER_PAGE),
  });

  return (
    <section className="mb-20">
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
      ) : (
        <div className="articles-grid mb-10">
          {isPending
            ? Array.from({ length: PER_PAGE }, (_, i) => (
                // biome-ignore lint/suspicious/noArrayIndexKey: fixed-length skeleton
                <div key={i} className="loading-anim h-50 rounded" />
              ))
            : data.map((post) => <ArticleCard key={post.slug} post={post} />)}
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
