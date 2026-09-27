import { useQuery } from "@tanstack/react-query";
import Chip from "~/components/chip";
import { retrieveArticleFromSlug } from "~/fetchers";
import { categories } from "../../constants";
import type { Route } from "./+types/article";

export default function Article({ params }: Route.ComponentProps) {
  const { slug } = params;
  const { isPending, isError, data, error } = useQuery({
    queryKey: ["slug"],
    queryFn: () => retrieveArticleFromSlug(slug),
  });
  if (isPending) {
    return <div>Pending...</div>;
  } else if (isError) {
    return <div>Error: {JSON.stringify(error)}</div>;
  } else {
    const category = categories.find(({ id }) => data.category === id);
    return (
      <main className="w-full min-h-screen bg-white">
        {/* title + featured image */}
        <section className="flex flex-col lg:flex-row">
          <section className="flex flex-col px-4 py-6 gap-8 w-full lg:w-1/2 min-h-100">
            {category && (
              <Chip
                title={category.title}
                icon={category.icon}
                color={category.color}
              />
            )}
          </section>
          <section className="bg-blue-300 min-h-100 w-full lg:w-1/2"></section>
        </section>
      </main>
    );
  }
}
