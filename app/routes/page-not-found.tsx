import { useQuery } from "@tanstack/react-query";
import ArticleCard from "~/components/article-card";
import SearchBar from "~/components/searchbar";
import { Spinner } from "~/components/ui/spinner";
import { retrieveFeaturedPosts } from "~/fetchers";
import { categoryFromID } from "~/utils";

export default function PageNotFound() {
  const { isPending, isError, data } = useQuery({
    queryKey: ["featured"],
    queryFn: () => retrieveFeaturedPosts(3),
  });
  return (
    <main className="w-full px-6 lg:px-[10%] pt-10 py-15 flex flex-col gap-10 items-stretch">
      <section className="flex flex-col items-stretch gap-2">
        <section className="flex gap-4 items-center">
          <h1 className="font-display text-6xl font-bold whitespace-nowrap">
            Page not found
          </h1>
          <div className="grow w-full h-0 border-black border" />
        </section>
        <p>
          The page you're looking for isn't available. It may have been removed,
          or there might have been a typo in the URL.
        </p>
      </section>
      <section className="flex flex-col items-stretch gap-2">
        <h1 className="font-display text-3xl font-bold whitespace-nowrap">
          Try searching for it again:
        </h1>
        <SearchBar width={"100%"} variant="page" />
      </section>
      <section className="flex flex-col items-stretch gap-2">
        <h1 className="font-display text-3xl font-bold whitespace-nowrap">
          Or, take a look at a few featured articles:
        </h1>
        {isPending && (
          <div className="flex justify-center my-4">
            <Spinner className="size-5" />
          </div>
        )}
        {isError && <p>Failed to load featured articles.</p>}
        {data && (
          <section className="w-full min-h-fit grid grid-cols-3 gap-6">
            {data?.map((article) => (
              <ArticleCard
                key={article.id}
                post={article}
                category={categoryFromID(article.category)}
                variant="grid"
                showCategory={false}
              />
            ))}
          </section>
        )}
      </section>
    </main>
  );
}
