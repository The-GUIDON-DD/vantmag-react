import { Link } from "react-router";
import { categories } from "../../constants";
import type { PostCard } from "../types";
import Chip from "./chip";

/**
 * The lead story. On the original site this is simply the newest post — there
 * are no sticky posts on the WordPress install.
 */
export default function Hero({ post }: { post: PostCard }) {
  const category = categories.find(({ id }) => id === post.category);
  const [author] = post.authors;

  return (
    <section className="hero mb-10">
      <Link to={`/${post.slug}`} className="article">
        <div className="thumbnail-container">
          {post.image ? (
            <img src={post.image} alt={post.imageAlt} className="thumbnail" />
          ) : (
            <div className="thumbnail bg-vant-purple" />
          )}
        </div>
        <div className="info px-7 md:px-12 lg:px-14">
          {category && (
            <div className="mb-2">
              <Chip
                title={category.title}
                icon={category.icon}
                color={category.color}
              />
            </div>
          )}
          <h2 className="title">{post.title}</h2>
          <div className="author-info">
            {author?.avatar_url && (
              <img
                src={author.avatar_url}
                alt={author.display_name}
                className="icon"
              />
            )}
            <div>
              {post.authors.length > 0 && (
                <p className="author">
                  {post.authors.map((a) => a.display_name).join(", ")}
                </p>
              )}
              <p className="date">{post.pubDate}</p>
            </div>
          </div>
        </div>
      </Link>
    </section>
  );
}
