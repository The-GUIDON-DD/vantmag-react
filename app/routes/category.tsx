import type { Route } from "./+types/category";

const categoryIds: Record<string, number> = {
  expose: 244,
  food: 12,
  hub: 242,
  hype: 243,
  music: 4,
  "theater-and-the-arts": 11,
  "tv-and-film": 13,
};

type Post = {
  id: number;
  link: string;
  title: { rendered: string };
};

//load posts
export async function clientLoader({
  params,
  request,
}: Route.ClientLoaderArgs) {
  const slug = params.slug ?? "";
  const categoryId = categoryIds[slug];

  if (!categoryId) {
    throw new Response("Category not found", { status: 404 });
  }

  const url = new URL("https://vantage.theguidon.com/wp-json/wp/v2/posts");
  url.searchParams.set("categories", String(categoryId));

  const response = await fetch(url, { signal: request.signal });

  if (!response.ok) {
    throw new Error(`Could not load articles (${response.status})`);
  }

  const posts = (await response.json()) as Post[];
  return { slug, posts };
}

clientLoader.hydrate = true as const;

//page display
export default function Category({ loaderData }: Route.ComponentProps) {
  if (!loaderData) {
    return <p>Loading articles…</p>;
  }

  return (
    <section>
      <h1>{loaderData.slug}</h1>
      {loaderData.posts.map((post: Post) => (
        <article key={post.id}>
          <a href={post.link}>{post.title.rendered}</a>
        </article>
      ))}
    </section>
  );
}
