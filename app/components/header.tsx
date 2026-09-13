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

function Search() {
  /** TODO: add in search bar **/
  return (
    <section className="w-full flex justify-center items-center py-6 h-28 bg-[#dddffe]">
      <section className="bg-white h-full rounded-full w-[50vw] px-10">
        <input
          type="text"
          className="bg-transparent border-none focus:outline-none focus:ring-0 w-full h-full"
        />
      </section>
    </section>
  );
}

export default function Header() {
  return (
    <header className="sticky w-screen flex flex-col items-stretch">
      <section className="py-4 w-full flex flex-col justify-center items-center bg-vant-purple">
        <Link to="/">
          <img
            src="/logo.svg"
            alt="Vantage Magazine"
            className="w-[15vw] mb-6"
          />
        </Link>
        <nav>
          <ul className="flex list-none text-white uppercase font-bold text-lg">
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
      </section>
      <Search />
    </header>
  );
}
