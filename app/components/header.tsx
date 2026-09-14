import { useState } from "react";
import { CgSearch } from "react-icons/cg";
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

function Search({ hidden = true }: { hidden?: boolean }) {
  /** TODO: add in search bar **/
  return (
    <section
      className="w-full flex justify-center items-center py-6 h-28 bg-[#dddffe] transition-transform duration-500 z-5"
      style={{ transform: hidden ? "translateY(-100%)" : "" }}
    >
      <section className="bg-white h-full rounded-full w-[50vw] px-5 flex items-center">
        <CgSearch className="text-vant-purple text-3xl mr-5" />
        <input
          type="text"
          className="bg-transparent border-none focus:outline-none focus:ring-0 w-full h-full text-2xl"
        />
      </section>
    </section>
  );
}

export default function Header() {
  const [showSearch, setShowSearch] = useState(false);

  return (
    <header className="sticky w-screen flex flex-col items-stretch">
      <section className="py-4 w-full flex flex-col justify-center items-center bg-vant-purple z-10">
        <Link to="/">
          <img
            src="/logo.svg"
            alt="Vantage Magazine"
            className="w-[15vw] mb-6"
          />
        </Link>
        <nav className="flex grid-cols-3 gap-15">
          <section className="col-start-2 justify-self-center">
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
          </section>
          <button
            onClick={() => setShowSearch((prev) => !prev)}
            type="button"
            className="text-white text-2xl font-bold"
          >
            <CgSearch />
          </button>
        </nav>
      </section>
      <Search hidden={!showSearch} />
      <button
        type="button"
        onClick={() => setShowSearch((prev) => !prev)}
        onKeyDown={() => setShowSearch((prev) => !prev)}
        className="fixed z-2 h-screen w-screen bg-[rgba(0,0,0,0.5)] duration-350 transition-all border-none outline-none"
        style={{
          opacity: showSearch ? 1 : 0,
          pointerEvents: showSearch ? "auto" : "none",
        }}
      />
    </header>
  );
}
