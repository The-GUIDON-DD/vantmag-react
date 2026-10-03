import { useQuery } from "@tanstack/react-query";
import { Link, useSearchParams } from "react-router";
import Bylines from "~/components/bylines";
import Chip from "~/components/chip";
import {
  retrieveArticlesFromSearch,
  retrieveAuthorsFromSearch,
  retrieveMediaFromID,
} from "~/fetchers";
import type { ArticleCardData } from "~/types";
import { categories } from "../../constants";

export function meta() {
  return [
    { title: "Search - Vantage Magazine" },
    { name: "description", content: "Search Vantage Magazine." },
  ];
}

function ArticleCard({ article }: { article: ArticleCardData }) {
  const category = categories.find(({ id }) => id === article.category);
  const mediaID = article.featured_image;
  const { data: media } = useQuery({
    queryKey: ["rendered", mediaID],
    queryFn: () => retrieveMediaFromID(mediaID),
    enabled: !!mediaID,
  });

  return (
    <li className="flex flex-col sm:flex-row gap-4 border-b border-gray-200 pb-8">
      {!!mediaID && (
        <section
          className="w-full sm:w-48 flex-none aspect-[3/2] overflow-hidden bg-gray-100 article-featured"
          // biome-ignore lint: needed to embed content from WordPress API
          dangerouslySetInnerHTML={{ __html: media ?? "" }}
        />
      )}
      <section className="flex flex-col gap-2">
        {category && (
          <Chip
            title={category.title}
            icon={category.icon}
            color={category.color}
          />
        )}
        <Link to={`/${article.slug}`}>
          <h2
            className="font-display text-2xl lg:text-3xl text-black"
            // biome-ignore lint: needed to embed content from WordPress API
            dangerouslySetInnerHTML={{ __html: article.title }}
          />
        </Link>
        <p
          className="text-gray-500"
          // biome-ignore lint: needed to embed content from WordPress API
          dangerouslySetInnerHTML={{ __html: article.excerpt }}
        />
        <section className="flex gap-2 text-sm text-gray-400 article-bylines">
          <Bylines authors={article.authors} />
          <span>&middot;</span>
          <span>{article.pubDate}</span>
        </section>
      </section>
    </li>
  );
}

export default function Search() {
  const [searchParams, setSearchParams] = useSearchParams();
  const term = searchParams.get("s")?.trim() ?? "";
  const page = Number(searchParams.get("page") ?? "1") || 1;
  const hasQuery = term.length > 0;

  const {
    isPending: isArticlesPending,
    isError: isArticlesError,
    data: articleResults,
  } = useQuery({
    queryKey: ["search-articles", term, page],
    queryFn: () => retrieveArticlesFromSearch(term, page),
    enabled: hasQuery,
  });

  const {
    isPending: isAuthorsPending,
    isError: isAuthorsError,
    data: authorResults,
  } = useQuery({
    queryKey: ["search-authors", term],
    queryFn: () => retrieveAuthorsFromSearch(term),
    enabled: hasQuery,
  });

  const categoryResults = hasQuery
    ? categories.filter(({ title }) =>
        title.toLowerCase().includes(term.toLowerCase()),
      )
    : [];

  const goToPage = (nextPage: number) => {
    setSearchParams({ s: term, page: String(nextPage) });
  };

  if (!hasQuery) {
    return (
      <main className="w-full min-h-screen bg-white px-6 lg:px-[10%] py-16">
        <p className="text-gray-400 text-lg lg:text-xl">
          Search for an article, author, or category.
        </p>
      </main>
    );
  }

  const isPending = isArticlesPending || isAuthorsPending;
  const isError = isArticlesError || isAuthorsError;
  const hasNoResults =
    !isPending &&
    !isError &&
    (articleResults?.articles.length ?? 0) === 0 &&
    (authorResults?.length ?? 0) === 0 &&
    categoryResults.length === 0;

  return (
    <main className="w-full min-h-screen bg-white px-6 lg:px-[10%] py-10 flex flex-col gap-10">
      <h1 className="font-display text-4xl lg:text-6xl text-black">
        Search results for &ldquo;{term}&rdquo;
      </h1>

      {isPending && <p className="text-gray-400 text-lg">Searching&hellip;</p>}

      {isError && (
        <p className="text-red-500 text-lg">
          Something went wrong while searching. Please try again.
        </p>
      )}

      {hasNoResults && (
        <p className="text-gray-400 text-lg">
          No results found for &ldquo;{term}&rdquo;.
        </p>
      )}

      {categoryResults.length > 0 && (
        <section className="flex flex-col gap-4">
          <p className="font-bold uppercase text-gray-400 text-lg">
            Categories
          </p>
          <section className="flex flex-wrap gap-4">
            {categoryResults.map(({ title, path, icon, color }) => (
              <Link to={path} key={title}>
                <Chip title={title} icon={icon} color={color} />
              </Link>
            ))}
          </section>
        </section>
      )}

      {!!authorResults?.length && (
        <section className="flex flex-col gap-4">
          <p className="font-bold uppercase text-gray-400 text-lg">Authors</p>
          <ul className="list-none flex flex-wrap gap-6">
            {authorResults.map(({ slug, display_name }) => (
              <li key={slug}>
                <Link
                  to={`/author/${slug}`}
                  className="text-vant-purple font-bold text-lg hover:underline"
                >
                  {display_name}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {!!articleResults?.articles.length && (
        <section className="flex flex-col gap-6">
          <p className="font-bold uppercase text-gray-400 text-lg">Articles</p>
          <ul className="list-none flex flex-col gap-8">
            {articleResults.articles.map((article) => (
              <ArticleCard key={article.slug} article={article} />
            ))}
          </ul>

          {articleResults.totalPages > 1 && (
            <nav className="flex gap-6 justify-center items-center text-vant-purple font-bold">
              {page > 1 && (
                <button type="button" onClick={() => goToPage(page - 1)}>
                  Previous
                </button>
              )}
              <span className="text-gray-400 font-normal">
                Page {page} of {articleResults.totalPages}
              </span>
              {page < articleResults.totalPages && (
                <button type="button" onClick={() => goToPage(page + 1)}>
                  Next
                </button>
              )}
            </nav>
          )}
        </section>
      )}
    </main>
  );
}
