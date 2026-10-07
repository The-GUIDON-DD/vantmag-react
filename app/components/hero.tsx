import { Link } from "react-router";
import { categories } from "../../constants";
import type { PostCard } from "../types";
import { formatAuthors } from "../utils";
import Chip from "./chip";

/**
 * The lead story. On the original site this is simply the newest post — there
 * are no sticky posts on the WordPress install.
 */
export default function Hero({ post }: { post: PostCard }) {
  const category = categories.find(({ id }) => id === post.category);
  const byline = formatAuthors(post.authors);

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
        {/* Same container as the grids below, so the hero copy lines up with
            the card columns instead of running to the viewport edge. */}
        <div className="info w-full max-w-[1440px] mx-auto px-9 md:px-10 lg:px-13 xl:px-16">
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
            <div>
              {byline && <p className="author">{byline}</p>}
              <p className="date">Published on {post.pubDate}</p>
            </div>
          </div>
        </div>
      </Link>
    </section>
  );
}
