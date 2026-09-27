import { useQuery } from "@tanstack/react-query";
import { FaFacebook, FaXTwitter } from "react-icons/fa6";
import { Link } from "react-router";
import Bylines from "~/components/bylines";
import Chip from "~/components/chip";
import { retrieveArticleFromSlug, retrieveMediaFromID } from "~/fetchers";
import { getSocMedUrlsFromArticle } from "~/utils";
import { categories } from "../../constants";
import type { Route } from "./+types/article";

export default function Article({ params }: Route.ComponentProps) {
  const { slug } = params;
  const { isPending, isError, data, error } = useQuery({
    queryKey: ["slug"],
    queryFn: () => retrieveArticleFromSlug(slug),
  });

  const mediaID = data?.featured_image;
  const {
    isPending: isMediaPending,
    isError: isMediaError,
    data: media,
    error: mediaError,
  } = useQuery({
    queryKey: ["rendered", mediaID],
    queryFn: () => retrieveMediaFromID(mediaID!),
    enabled: !!mediaID,
  });

  if (isPending) {
    return <div>Pending...</div>;
  } else if (isError) {
    return <div>Error: {JSON.stringify(error)}</div>;
  } else {
    const category = categories.find(({ id }) => data.category === id);
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
            <h1 className="text-black text-5xl lg:text-7xl w-full font-display">
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
          <section
            className="bg-blue-300 min-h-100 lg:min-h-150 w-full lg:w-1/2 article-featured"
            // biome-ignore lint: needed to embed content from WordPress API
            dangerouslySetInnerHTML={{ __html: media ?? "" }}
          />
        </section>
        <section className="bg-vant-purple px-6 lg:px-[5%] py-8 text-white flex flex-col gap-2 text-md lg:text-xl">
          <p>Written by</p>
          <p className="font-display text-3xl lg:text-4xl article-bylines">
            <Bylines authors={data.authors} />
          </p>
          <p>{data.pubDate}</p>
        </section>
        <section
          className="w-full bg-white px-6 lg:px-[20%] py-10 flex flex-col gap-8 text-black text-md lg:text-lg"
          // biome-ignore lint: needed to embed content from WordPress API
          dangerouslySetInnerHTML={{ __html: data.content }}
        />
      </main>
    );
  }
}
