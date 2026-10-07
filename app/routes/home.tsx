import { useQuery } from "@tanstack/react-query";
import ArticleCard from "~/components/article-card";
import CategoryTabs from "~/components/category-tabs";
import Hero from "~/components/hero";
import SectionHeading from "~/components/section-heading";
import { retrieveHomeData } from "~/fetchers";

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

function HomeSkeleton() {
  return (
    <div className="px-4 md:px-16 py-10 flex flex-col gap-10">
      <div className="loading-anim h-100 rounded" />
      <div className="articles-grid">
        {Array.from({ length: 6 }, (_, i) => (
          // biome-ignore lint/suspicious/noArrayIndexKey: fixed-length skeleton
          <div key={i} className="loading-anim h-50 rounded" />
        ))}
      </div>
    </div>
  );
}

export default function Home() {
  const { isPending, isError, error, data } = useQuery({
    queryKey: ["home"],
    queryFn: retrieveHomeData,
  });

  if (isPending) return <HomeSkeleton />;

  if (isError || !data?.hero) {
    if (error) console.error("Failed to load home data:", error);

    return (
      <main className="px-4 md:px-16 py-20 text-center">
        <h1 className="font-display text-4xl mb-4">Something went wrong</h1>
        <p className="text-gray-600">
          We couldn't load the latest stories. Please try again later.
        </p>
      </main>
    );
  }

  return (
    <main id="index" className="w-full">
      <Hero post={data.hero} />

      <div className="mx-auto w-full max-w-[1440px] px-4 sm:px-7 md:px-10 lg:px-13 xl:px-16">
        <section className="latest-grid mb-20">
          {data.latest.map((post, ix) => (
            <ArticleCard key={post.slug} post={post} showExcerpt={ix === 0} />
          ))}
        </section>

        <section className="mb-20">
          <SectionHeading>Here is something for you.</SectionHeading>
          <div className="articles-grid">
            {data.suggestions.map((post) => (
              <ArticleCard key={post.slug} post={post} />
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
