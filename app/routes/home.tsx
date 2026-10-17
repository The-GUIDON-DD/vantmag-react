import { useQuery } from "@tanstack/react-query";
import type { CSSProperties } from "react";
import ArticleCard from "~/components/article-card";
import CategoryTabs from "~/components/category-tabs";
import Hero from "~/components/hero";
import SectionHeading from "~/components/section-heading";
import { retrieveHomeData } from "~/fetchers";
import type { ArticleCardData } from "~/types";
import { categories } from "../../constants";

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
  const { isPending, isError, error, data } = useQuery({
    queryKey: ["home"],
    queryFn: retrieveHomeData,
  });

  if (isPending) {
    return <p className="p-8">Loading articles...</p>;
  }

  if (isError || !data.hero) {
    return (
      <main className="mx-auto w-full max-w-[1240px] px-4 py-20 text-center">
        <h1 className="mb-4 font-display text-4xl">Something went wrong</h1>
        <p role="alert" className="text-gray-600">
          We couldn't load the latest stories. Please try again.{" "}
          {error?.message}
        </p>
      </main>
    );
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

      <div className="mx-auto w-full max-w-[1240px] px-4 lg:w-[90%] lg:px-5">
        <section className="latest-grid mb-20">
          {data.latest.map((post, ix) => (
            <div key={post.id} style={highlight(post)}>
              <ArticleCard
                post={post}
                category={categoryOf(post)}
                variant={ix === 0 ? "featured" : "row"}
                showExcerpt={ix === 0}
              />
            </div>
          ))}
        </section>

        <section className="mb-20">
          <SectionHeading>Here is something for you.</SectionHeading>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {data.suggestions.map((post) => (
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
