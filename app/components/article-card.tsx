import { Link } from "react-router";
import { categories } from "../../constants";
import type { PostCard } from "../types";
import Chip from "./chip";

/**
 * The card used everywhere on the site. Layout lives in `app.css` under
 * `.article` so the grids that reshape it (`#latest`, `.articles-grid`) can do
 * so positionally, the way the original theme did.
 */
export default function ArticleCard({
  post,
  showExcerpt = true,
}: {
  post: PostCard;
  showExcerpt?: boolean;
}) {
  const category = categories.find(({ id }) => id === post.category);
  const bylines = post.authors.map((a) => a.display_name).join(", ");

  return (
    <Link
      to={`/${post.slug}`}
      className="article"
      style={
        { "--hover-color": category?.color ?? "#dddffe" } as React.CSSProperties
      }
    >
      <div className="thumbnail-container">
        {post.image ? (
          <img
            src={post.image}
            alt={post.imageAlt}
            loading="lazy"
            className="thumbnail"
          />
        ) : (
          <div className="thumbnail loading-anim" />
        )}
      </div>
      <div className="info">
        {category && (
          <div className="mb-2">
            <Chip
              title={category.title}
              icon={category.icon}
              color={category.color}
            />
          </div>
        )}
        <h3 className="title">{post.title}</h3>
        {showExcerpt && <p className="excerpt">{post.excerpt}</p>}
        {bylines && <p className="authors">{bylines}</p>}
        <p className="date">{post.pubDate}</p>
        <p className="authors-date">
          {bylines ? `${bylines} · ${post.pubDate}` : post.pubDate}
        </p>
      </div>
    </Link>
  );
}
