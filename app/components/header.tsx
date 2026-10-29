import { useState } from "react";
import { CgSearch } from "react-icons/cg";
import { RxCross1, RxHamburgerMenu } from "react-icons/rx";
import { Link, NavLink } from "react-router";
import SearchBar from "./searchbar";

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
  return (
    <section
      className="w-full flex justify-center items-center py-6 h-28 bg-[#dddffe] transition-transform duration-500 z-5 absolute bottom-0 left-0"
      style={{ transform: hidden ? "" : "translateY(100%)" }}
    >
      <SearchBar />
    </section>
  );
}
function Sidebar({ hideSidebar }: { hideSidebar: () => void }) {
  return (
    <aside className="fixed inset-0 h-dvh w-dvw flex flex-col bg-vant-purple px-10">
      <button
        type="button"
        id="sidebar-btn"
        className="absolute z-10 outline-none top-9 left-8  text-white text-3xl border-2 border-red-300"
        onClick={hideSidebar}
      >
        <RxCross1 />
      </button>
      <section className="py-4 w-full flex flex-col justify-center items-center z-10">
        <Link to="/">
          <img
            src="/logos/LongFormVantMag.svg"
            alt="Vantage Magazine"
            className="lg:hidden min-w-40 max-w-50 w-[30vw] mt-4 mb-4"
          />
          <img
            src="/logo.svg"
            alt="Vantage Magazine"
            className="hidden lg:block min-w-80 lg:w-[20vw] mt-4 mb-4 lg:mt-0 lg:mb-6"
          />
        </Link>
      </section>
      <SearchBar width="100%" />
      <nav>
        <ul className="mt-8 list-none flex flex-col items-stretch gap-4 text-white uppercase font-bold text-lg">
          {links.map(({ title, path }) => (
            <li key={title}>
              <NavLink
                to={path}
                end
                className={({ isActive }) =>
                  isActive
                    ? "underline decoration-[2.5px] underline-offset-4"
                    : undefined
                }
              >
                {title}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}

export default function Header() {
  const [showSearch, setShowSearch] = useState(false);
  const [showSidebar, setShowSideBar] = useState(false);

  return (
    <>
      {showSidebar && <Sidebar hideSidebar={() => setShowSideBar(false)} />}
      {!showSidebar && (
        <header className="sticky inset-0 w-screen flex flex-col items-stretch justify-center z-100">
          <section className="py-4 w-full flex flex-col justify-center items-center bg-vant-purple z-10">
            <Link to="/">
              <img
                src="/logos/LongFormVantMag.svg"
                alt="Vantage Magazine"
                className="lg:hidden min-w-40 max-w-50 w-[30vw] mt-4 mb-4"
              />
              <img
                src="/logo.svg"
                alt="Vantage Magazine"
                className="hidden lg:block min-w-80 lg:w-[20vw] mt-4 mb-4 lg:mt-0 lg:mb-6"
              />
            </Link>
            {/* Equal-growing fillers either side keep the link list centred on
                the page, with the search icon centred in the right-hand gap —
                the same arrangement the original theme uses. */}
            <nav className="hidden lg:flex w-full min-h-12 px-4">
              <div className="flex w-full max-w-[1440px] mx-auto items-center">
                <div className="grow" />
                <ul className="flex items-center list-none text-white uppercase font-bold text-lg whitespace-nowrap">
                  {links.map(({ title, path }, ix) => (
                    <li key={title}>
                      <NavLink
                        to={path}
                        end
                        className={({ isActive }) =>
                          isActive
                            ? "underline decoration-[2.5px] underline-offset-4"
                            : undefined
                        }
                      >
                        {title}
                      </NavLink>
                      {ix < links.length - 1 && (
                        <span className="mx-4">&middot;</span>
                      )}
                    </li>
                  ))}
                </ul>
                <div className="grow flex justify-center">
                  <button
                    onClick={() => setShowSearch((prev) => !prev)}
                    type="button"
                    aria-label="Search"
                    className="text-white text-2xl font-bold"
                  >
                    <CgSearch />
                  </button>
                </div>
              </div>
            </nav>
          </section>
          <Search hidden={!showSearch} />
          <button
            type="button"
            onClick={() => setShowSearch((prev) => !prev)}
            onKeyDown={() => setShowSearch((prev) => !prev)}
            className="absolute z-2 h-dvh w-dvw inset-0 bg-[rgba(0,0,0,0.5)] duration-350 transition-all border-none outline-none"
            style={{
              opacity: showSearch ? 1 : 0,
              pointerEvents: showSearch ? "auto" : "none",
            }}
          />
          <button
            type="button"
            id="sidebar-btn"
            className="fixed z-10 lg:hidden outline-none top-9 left-8  text-white text-3xl"
            onClick={() => setShowSideBar(true)}
          >
            <RxHamburgerMenu />
          </button>
        </header>
      )}
    </>
  );
}
