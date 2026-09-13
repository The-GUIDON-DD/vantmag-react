import { Link } from "react-router";

const links = [
  {
    title: "Home",
    path: "/",
  },
  {
    title: "TV & FILM",
    path: "/category/tv-and-film",
  },
  {
    title: "FOOD",
    path: "/category/food",
  },
  {
    title: "THEATER & ARTS",
    path: "/category/theater-and-the-arts",
  },
  {
    title: "MUSIC",
    path: "/category/music",
  },
  {
    title: "HYPE",
    path: "/category/hype",
  },
  {
    title: "HUB",
    path: "/category/hub",
  },
  {
    title: "EXPOSE",
    path: "/category/expose",
  },
  {
    title: "ABOUT",
    path: "/welcome-to-vantage",
  },
];
export default function Header() {
  return (
    <header className="sticky w-screen py-4 flex flex-col justify-center items-center bg-vant-purple">
      <Link to="/">
        <img src="/logo.svg" alt="Vantage Magazine" className="w-[15vw] mb-5" />
      </Link>
      <nav>
        <ul className="flex list-none text-white uppercase">
          {links.map(({ title, path }, ix) => (
            <li key={title}>
              <Link to={path}>
                {title}
                {ix < links.length - 1 && (
                  <span className="mx-4">&middot;</span>
                )}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}
