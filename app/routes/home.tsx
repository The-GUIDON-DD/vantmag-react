import { useQuery } from "@tanstack/react-query";
import type { CSSProperties } from "react";
import ArticleSkeleton from "~/components/ArticleSkeleton";
import ArticleCard from "~/components/article-card";
import CategoryTabs from "~/components/category-tabs";
import Hero from "~/components/hero";
import SectionHeading from "~/components/section-heading";
import { Spinner } from "~/components/ui/spinner";
import { retrieveFeaturedPosts, retrieveHomeData } from "~/fetchers";
import type { ArticleCardData } from "~/types";
import { categories } from "../../constants";
import PageNotFound from "./page-not-found";

export function meta() {
  return [
    { title: "Vantage Magazine" },
    {
      name: "description",
      content:
        "We are The GUIDON's online magazine, a publication geared towards campus culture and the people who make it.",
    },
  ];
}

function categoryOf(post: ArticleCardData) {
  return Object.values(categories).find(({ id }) => id === post.category);
}

export default function Home() {
  const { isPending, isError, data } = useQuery({
    queryKey: ["home"],
    queryFn: retrieveHomeData,
  });

  const {
    data: suggestions,
    isPending: isSuggestionsPending,
    isError: isSuggestionsError,
  } = useQuery({
    queryKey: ["home-suggested"],
    queryFn: () => retrieveFeaturedPosts(6),
  });

  if (isPending) {
    return <ArticleSkeleton />;
  }

  if (isError || !data.hero) {
    return <PageNotFound />;
  }

  // Tint each card's hover with its own category colour, the way the category
  // page does.
  const highlight = (post: ArticleCardData) =>
    ({
      "--category-article-highlight": `color-mix(in srgb, ${
        categoryOf(post)?.color ?? "#5d61ba"
      } 18%, white)`,
    }) as CSSProperties;

  return (
    <main id="index" className="w-full">
      <Hero post={data.hero} />

      <div className="mx-auto w-full px-4 lg:w-[90%] lg:px-5">
        <section className="latest-grid mb-20">
          <div style={highlight(data.latest[0])}>
            <ArticleCard
              post={data.latest[0]}
              category={categoryOf(data.latest[0])}
              variant="featured"
              showExcerpt={true}
            />
          </div>
          <section className="latest-grid-tall-images size-full flex flex-col items-stretch gap-12">
            {data.latest.slice(1, 3).map((post) => (
              <div key={post.id} style={highlight(post)}>
                <ArticleCard
                  post={post}
                  category={categoryOf(post)}
                  variant="featured-row"
                  showExcerpt={false}
                />
              </div>
            ))}
          </section>
          <section className="latest-grid-small-images size-full flex flex-col items-stretch gap-6">
            {data.latest.slice(3).map((post) => (
              <div key={post.id} style={highlight(post)}>
                <ArticleCard
                  post={post}
                  category={categoryOf(post)}
                  variant="featured-row"
                  showExcerpt={false}
                />
              </div>
            ))}
          </section>
        </section>

        <section className="mb-20">
          <SectionHeading>Here is something for you.</SectionHeading>
          {isSuggestionsError && (
            <p className="w-full">Failed to retrieve suggested articles.</p>
          )}
          {isSuggestionsPending && (
            <div className="w-full flex justify-center">
              <Spinner />
            </div>
          )}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {suggestions?.map((post) => (
              <div key={post.id} style={highlight(post)}>
                <ArticleCard
                  post={post}
                  category={categoryOf(post)}
                  variant="grid"
                />
              </div>
            ))}
          </div>
        </section>

        <section>
          <SectionHeading>Categories</SectionHeading>
          <CategoryTabs />
        </section>
      </div>
    </main>
  );
}
