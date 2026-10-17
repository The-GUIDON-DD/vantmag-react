import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router";
import { categories } from "../../constants";
import { retrieveMediaFromID } from "../fetchers";
import type { ArticleCardData } from "../types";
import { parseImage, plainText } from "../utils";
import Bylines from "./bylines";
import Chip from "./chip";

const FALLBACK_IMAGE_URL =
  "https://vantage.theguidon.com/wp-content/themes/vantmag-revamp-2022/assets/images/vantmag_16x9.png";

/**
 * The lead story. Deliberately not an `ArticleCard` — the original site renders
 * this full-bleed with the image behind the copy, which none of the card
 * variants cover.
 */
export default function Hero({ post }: { post: ArticleCardData }) {
  const category = Object.values(categories).find(
    ({ id }) => id === post.category,
  );
  const authors = post.authors ?? [];

  const { data: image } = useQuery({
    queryKey: ["rendered", post.featured_media],
    queryFn: () => retrieveMediaFromID(post.featured_media),
    enabled: post.featured_media > 0,
    select: parseImage,
    retry: false,
  });

  return (
    <section className="hero mb-10">
      <div className="article">
        <div className="thumbnail-container">
          <img
            src={image?.src || FALLBACK_IMAGE_URL}
            srcSet={image?.srcSet}
            sizes={image?.sizes}
            alt={image?.alt || ""}
            className="thumbnail"
          />
        </div>
        {/* Same container as the grids below, so the hero copy lines up with
            the card columns instead of running to the viewport edge. */}
        <div className="info mx-auto w-full max-w-[1240px] px-4 lg:w-[90%] lg:px-5">
          {category && (
            <div className="mb-2">
              <Chip
                title={category.title}
                icon={category.icon}
                color={category.color}
              />
            </div>
          )}
          <h2 className="title">
            <Link to={`/${post.slug}`}>{plainText(post.title)}</Link>
          </h2>
          <div className="author-info">
            <div>
              {authors.length > 0 && (
                <p className="author">
                  By <Bylines authors={authors} />
                </p>
              )}
              <p className="date">Published on {post.pubDate}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
