import { Link } from "react-router";
import { categories } from "../../constants";
import type { PostCard } from "../types";
import { formatAuthors } from "../utils";
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
  const byline = formatAuthors(post.authors);

  return (
    <Link
      to={`/${post.slug}`}
      className="article"
      style={
        {
          // The theme tints the hover background to 25% of the category colour.
          "--hover-color": category ? `${category.color}40` : "transparent",
        } as React.CSSProperties
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
        {byline && <p className="authors">By {byline}</p>}
        <p className="date">{post.pubDate}</p>
        <p className="authors-date">
          {byline && <strong>By {byline}</strong>}
          {byline && " • "}
          {post.pubDate}
        </p>
      </div>
    </Link>
  );
}
