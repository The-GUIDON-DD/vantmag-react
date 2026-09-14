const socmedLinks = [
  {
    title: "Facebook",
    icon: "/icons/facebook.svg",
    url: "https://www.facebook.com/TheGUIDON",
  },
  {
    title: "Twitter",
    icon: "/icons/twitter.svg",
    url: "https://www.twitter.com/TheGUIDON",
  },
  {
    title: "Instagram",
    icon: "/icons/instagram.svg",
    url: "https://www.instagram.com/TheGUIDON",
  },
  {
    title: "Spotify",
    icon: "/icons/spotify.svg",
    url: "https://open.spotify.com/show/0t2PxYpSft6HfoPHibwAvT",
  },
  {
    title: "Youtube",
    icon: "/icons/youtube.svg",
    url: "https://www.youtube.com/@TheGuidon",
  },
];

export default function Footer() {
  return (
    <footer className="bg-vant-purple h-[35vh] w-full px-[20vw] pt-15 md:grid-cols-3 md:grid gap-5 text-white">
      <section className="w-full flex flex-col">
        <img alt="Vantage Magazine" src="/logo.svg" className="w-full pb-6" />
        <p className="pb-4">
          We are The GUIDON's online magazine, a publication geared towards
          campus culture and the people who make it.
        </p>
        <p className="pb-4">© The GUIDON 2026. All rights reserved.</p>
        <p className="pb-4">
          Designed and developed by Digital Development 2022-2023, 2023-2024,
          and 2026-2027.
        </p>
        <section className="flex gap-2">
          {socmedLinks.map(({ icon, url, title }) => (
            <a href={url} key={title}>
              <img alt={title} src={icon} className="aspect-square h-[8]" />
            </a>
          ))}
        </section>
      </section>
      <section className="justify-self-center align-self-center mt-8 flex flex-col gap-4">
        <p className="font-bold uppercase">More from the GUIDON</p>
        <a href="https://theguidon.com">
          <p>The GUIDON Main</p>
        </a>
        <a href="https://interactive.theguidon.com">
          <p>The GUIDON Interactives</p>
        </a>
        <a href="https://archives.theguidon.com">
          <p>The GUIDON Archives</p>
        </a>
      </section>
      <section className="mt-8">
        <p className="font-bold uppercase">Categories</p>
      </section>
    </footer>
  );
}
