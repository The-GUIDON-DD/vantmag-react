import { CgSearch } from "react-icons/cg";
import { Form } from "react-router";

export default function SearchBar({
  width = "50vw",
  variant = "header",
}: {
  width?: string | number;
  variant?: "header" | "page";
}) {
  const PADDING = variant === "header" ? "px-5 py-4" : "p-3";
  const SEARCH_BG = variant === "header" ? "bg-white" : "bg-[#dddffecc]";
  const SEARCH_TEXT_SIZE =
    variant === "header" ? "text-md lg:text-xl" : "text-md";
  return (
    <section
      className={`${SEARCH_BG} rounded-full ${PADDING} flex items-center`}
      style={{ width: width }}
    >
      <CgSearch
        className={`text-vant-purple ${variant === "header" ? "text-3xl" : "text-xl"} mr-5`}
      />
      <Form action="/search" className="grow">
        <input
          type="text"
          name="s"
          placeholder="Search an article, author, or category"
          className={`bg-transparent border-none focus:outline-none focus:ring-0 w-full h-full ${SEARCH_TEXT_SIZE}`}
        />
      </Form>
    </section>
  );
}
