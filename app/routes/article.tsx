import { useQuery } from "@tanstack/react-query";
import parse, { Element } from "html-react-parser";
import DOMPurify from "isomorphic-dompurify";
import { FaFacebook, FaXTwitter } from "react-icons/fa6";
import ArticleCard from "~/components/article-card";
import Bylines from "~/components/bylines";
import Chip from "~/components/chip";
import { Skeleton } from "~/components/ui/skeleton";
import { Spinner } from "~/components/ui/spinner";
import {
  retrieveArticleFromSlug,
  retrieveMediaFromID,
  retrieveRelatedArticles,
} from "~/fetchers";
import { getSocMedUrlsFromArticle, parseImage } from "~/utils";
import { categories } from "../../constants";
import type { Route } from "./+types/article";

function SanitizedContent({ html }: { html: string }) {
  const cleanHTML = DOMPurify.sanitize(html, {
    ADD_ATTR: ["data-opinionstage-widget"], // whitelist opinion stage quizzes (UPDATE IF API CHANGES)
  });

  // NOTE: <script> tag for Opinion Stage does not work because of
  // HTML sanitization so replace the Opinion Stage widget with an
  // iframe embedding the actual quiz

  const reactNodes = parse(cleanHTML, {
    replace: (domNode) => {
      if (
        domNode instanceof Element &&
        domNode.attribs &&
        "data-opinionstage-widget" in domNode.attribs
      ) {
        const widgetID = domNode.attribs["data-opinionstage-widget"];
        return (
          <div className="wp-opinionstage-quiz w-full my-6 flex justify-center">
            <iframe
              title="Opinion Stage Quiz"
              name="opinionstage-widget"
              src={`https://www.opinionstage.com/api/v2/widgets/${widgetID}/iframe?em=1`}
              data-opinionstage-iframe={widgetID}
              width="100%"
              height="800"
              className="border-none shadow-lg rounded-xl wp-opinionstage-quiz"
              allow="fullscreen"
              loading="lazy"
            ></iframe>
          </div>
        );
      }
    },
  });

  return (
    <section className="w-full bg-white px-6 lg:px-[20%] py-10 flex flex-col gap-8 text-black text-md lg:text-lg">
      {reactNodes}
    </section>
  );
}

export default function Article({ params }: Route.ComponentProps) {
  const { slug } = params;
  const { isPending, isError, data, error } = useQuery({
    queryKey: [slug],
    queryFn: () => retrieveArticleFromSlug(slug),
  });

  const mediaID = data?.featured_media;
  const { data: media } = useQuery({
    queryKey: [mediaID],
    queryFn: () => retrieveMediaFromID(mediaID!),
    enabled: !!mediaID,
  });

  const mediaAttrs = media
    ? parseImage(media)
    : { src: "/default_image.webp", alt: "Vantage Magazine" };

  const articleID = data?.id;
  const {
    isPending: isRelatedPending,
    isError: isRelatedError,
    data: relatedArticles,
  } = useQuery({
    queryKey: [articleID],
    queryFn: () => retrieveRelatedArticles(data!),
    enabled: !!data,
  });

  if (isPending) {
    return (
      <div className="w-full bg-white px-6 lg:px-[15%] py-20 flex flex-col gap-8">
        <div className="flex w-full flex-col gap-2">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-3/4" />
        </div>
        <div className="flex w-full flex-col gap-2">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-3/4" />
        </div>
        <div className="flex w-full flex-col gap-2">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-3/4" />
        </div>
      </div>
    );
  } else if (isError) {
    return <div>Error: {JSON.stringify(error)}</div>;
  } else {
    const category = Object.values(categories).find(
      ({ id }) => data.category === id,
    );
    const { facebook: fbUrl, x: xUrl } = getSocMedUrlsFromArticle(data);
    return (
      <main className="w-full min-h-screen bg-white">
        {/* title + featured image */}
        <section className="flex flex-col lg:flex-row">
          <section className="flex flex-col px-4 lg:px-10 lg:justify-center py-6 gap-8 w-full lg:w-1/2">
            {category && (
              <Chip
                title={category.title}
                icon={category.icon}
                color={category.color}
              />
            )}
            <h1 className="text-black text-5xl lg:text-7xl w-full font-display font-bold">
              {data.title}
            </h1>
            <section>
              <p className="font-bold uppercase text-lg text-gray-400 mb-2">
                Share
              </p>
              <section className="flex gap-4 text-gray-500 text-lg">
                <a href={fbUrl}>
                  <FaFacebook />
                </a>
                <a href={xUrl}>
                  <FaXTwitter />
                </a>
              </section>
            </section>
          </section>
          <section className="bg-blue-300 lg:min-h-150 w-full lg:w-1/2 article-featured">
            <img
              alt="Vantage Magazine"
              src="/default_image.webp"
              className="w-full object-cover min-h-full min-w-full"
              {...mediaAttrs}
            />
          </section>
        </section>
        <section className="bg-vant-purple px-6 lg:px-[5%] py-8 text-white flex flex-col gap-2 text-md lg:text-xl">
          <p>Written by</p>
          <p className="font-display text-3xl lg:text-4xl article-bylines">
            <Bylines authors={data.authors || []} />
          </p>
          <p>{data.pubDate}</p>
        </section>
        <SanitizedContent html={data.content} />
        <section className="w-full mb-4 px-6 lg:px-[20%] flex items-center gap-3">
          <h1 className="font-display font-bold text-black text-3xl whitespace-nowrap">
            You might like these!
          </h1>
          <div className="h-0 grow w-full border-black border-t" />
        </section>
        <section className="w-full min-h-fit mb-15 px-6 lg:px-[20%] grid grid-cols-3 gap-4">
          {isRelatedPending && (
            <div className="w-full col-span-3 flex justify-center">
              <Spinner />
            </div>
          )}
          {isRelatedError && (
            <div className="w-full col-span-3 flex justify center">
              <p>Failed to fetch articles.</p>
            </div>
          )}
          {relatedArticles &&
            relatedArticles?.map((article) => (
              <ArticleCard
                key={article.id}
                post={article}
                category={categories[0]}
                variant="grid"
                showCategory={false}
              />
            ))}
        </section>
      </main>
    );
  }
}
