import { useInfiniteQuery } from "@tanstack/react-query";
import ArticleCard from "~/components/article-card";
import { retrieveArticlesFromAuthor, retrieveAuthorFromSlug } from "~/fetchers";
import type { ArticleCardData, Author } from "~/types";
import { categories, page_size_values } from "../../constants";
import type { Route } from "./+types/author";

export async function clientLoader({ params }: Route.ClientLoaderArgs) {
  const data = await retrieveAuthorFromSlug(params.slug);
  return { data };
}

function AuthorArticles({ author_id }: { author_id: number }) {
  const {
    isPending,
    isError,
    data,
    error,
    isFetchNextPageError,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
  } = useInfiniteQuery({
    queryKey: ["author-page", author_id],
    initialPageParam: 0,
    queryFn: ({ pageParam }) =>
      retrieveArticlesFromAuthor(
        author_id,
        pageParam,
        pageParam === 0
          ? page_size_values.PAGE_SIZE
          : page_size_values.MORE_PAGE_SIZE,
      ),
    getNextPageParam: (lastPage, pages) =>
      lastPage.hasMore
        ? pages.reduce((count, page) => count + page.posts.length, 0)
        : undefined,
  });

  if (isPending) {
    return <p>Pending...</p>;
  } else if (isError || !data) {
    return <p>Error fetching data: {String(error)}</p>;
  } else if (data) {
    const articles = data.pages.flatMap((page) => page.posts);
    return (
      <section className="w-full flex flex-col gap-4 items-center">
        <section className="w-full min-h-fit mb-15 grid grid-cols-1 lg:grid-cols-3 gap-4">
          {isPending && <p>Pending articles...</p>}
          {isError && <p>Failed to fetch articles: {String(error)}</p>}
          {articles &&
            articles.map((article: ArticleCardData) => {
              const category = article.category
                ? Object.values(categories).find(
                    ({ id }: { id: number }) => id === article.category,
                  )
                : null;

              return (
                <ArticleCard
                  key={article.id}
                  post={article}
                  category={category || categories[0]}
                  variant="grid"
                  showCategory={!!category}
                />
              );
            })}
        </section>
        {hasNextPage && (
          <div className="mt-14 text-center">
            <button
              type="button"
              onClick={() => void fetchNextPage()}
              disabled={isFetchingNextPage}
              className="rounded-full bg-[#dddffe] px-16 py-2.5 text-sm font-bold uppercase text-vant-purple hover:bg-[#cdd0ff] disabled:opacity-60"
            >
              {isFetchingNextPage ? "Loading…" : "Show me more"}
            </button>
          </div>
        )}
        {isFetchNextPageError && (
          <p role="alert" className="mt-4 text-center text-red-700">
            Could not load more articles. Please try again.
          </p>
        )}
      </section>
    );
  }
}

export default function AuthorPage({ loaderData }: Route.ComponentProps) {
  const author: Author = loaderData.data;

  return (
    <main className="w-full">
      <section className="w-full px-6 lg:px-15 pt-10 py-15 bg-vant-purple-light">
        <p className="uppercase font-bold font-sans w-full text-vant-purple mb-2 text-xl">
          Writer
        </p>
        <h1 className="font-display w-full text-vant-purple-dark text-6xl">
          {author.display_name}
        </h1>
      </section>
      <section className="w-full min-h-fit my-15 px-6 lg:px-[10%]">
        <section className="w-full mb-6 flex items-center gap-3">
          <h1 className="font-display font-bold text-black text-5xl whitespace-nowrap">
            Written Articles
          </h1>
          <div className="h-0 grow w-full border-black border-t" />
        </section>
        <AuthorArticles author_id={author.id} />
      </section>
    </main>
  );
}
