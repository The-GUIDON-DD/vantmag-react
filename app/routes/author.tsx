import { useQuery } from "@tanstack/react-query";
import ArticleCard from "~/components/article-card";
import { retrieveArticlesFromAuthor, retrieveAuthorFromSlug } from "~/fetchers";
import type { ArticleCardData, Author } from "~/types";
import { categories } from "../../constants";
import type { Route } from "./+types/author";

export async function clientLoader({ params }: Route.ClientLoaderArgs) {
  const data = await retrieveAuthorFromSlug(params.slug);
  return { data };
}

export default function AuthorPage({
  params,
  loaderData,
}: Route.ComponentProps) {
  const author: Author = loaderData.data;

  const {
    isPending,
    isError,
    data: articles,
    error,
  } = useQuery({
    queryKey: [author.id],
    queryFn: () => retrieveArticlesFromAuthor(author.id),
  });

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
      </section>
    </main>
  );
}
