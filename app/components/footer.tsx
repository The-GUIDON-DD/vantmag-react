import { Link } from "react-router";
import Chip from "./chip";

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
const categories = [
  {
    title: "TV & FILM",
    path: "/category/tv-and-film",
    icon: "/icons/chip/tv-and-film.svg",
    color: "#ef3e68",
  },
  {
    title: "FOOD",
    path: "/category/food",
    icon: "/icons/chip/food.svg",
    color: "#f9a524",
  },
  {
    title: "THEATER & ARTS",
    path: "/category/theater-and-the-arts",
    icon: "/icons/chip/theater-and-the-arts.svg",
    color: "#755489",
  },
  {
    title: "MUSIC",
    path: "/category/music",
    icon: "/icons/chip/music.svg",
    color: "#b5c932",
  },
  {
    title: "HYPE",
    path: "/category/hype",
    icon: "/icons/chip/hype.svg",
    color: "#d63ba3",
  },
  {
    title: "HUB",
    path: "/category/hub",
    icon: "/icons/chip/hub.svg",
    color: "#3dbb95",
  },
  {
    title: "EXPOSÉ",
    path: "/category/expose",
    icon: "/icons/chip/expose.svg",
    color: "#f6B50b",
  },
];

export default function Footer() {
  return (
    <footer className="bg-vant-purple min-h-fit w-full  px-[15vw] md:px-[10vw] xl:px-[20vw] py-15 flex flex-col items-stretch lg:grid-cols-3 lg:grid gap-5 text-white">
      <section className="min-w-fit w-full flex flex-col order-first">
        <img
          alt="Vantage Magazine"
          src="/logo.svg"
          className="w-full pb-6 min-w-[300px]"
        />
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
      <section className="mt-8 md:order-last">
        <p className="font-bold uppercase">Categories</p>
        <section className="w-full flex flex-wrap gap-4 mt-4">
          {categories.map(({ title, path, icon, color }) => (
            <Link to={path} key={title}>
              <Chip title={title} icon={icon} color={color} />
            </Link>
          ))}
        </section>
      </section>
    </footer>
  );
}
