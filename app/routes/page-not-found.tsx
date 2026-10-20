export default function PageNotFound() {
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
      </section>
      <section className="flex flex-col items-stretch gap-2">
        <h1 className="font-display text-3xl font-bold whitespace-nowrap">
          Or, take a look at a few featured articles:
        </h1>
      </section>
    </main>
  );
}
