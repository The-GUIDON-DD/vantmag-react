import { useQuery } from "@tanstack/react-query";
import { retrieveArticleFromSlug } from "~/fetchers";
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
    return <div>Article Success: {data.title}</div>;
  }
}
