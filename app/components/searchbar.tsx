import { CgSearch } from "react-icons/cg";
import { Form } from "react-router";

export default function SearchBar({
  width = "50vw",
}: {
  width?: string | number;
}) {
  return (
    <section
      className="bg-white rounded-full px-5 py-4 flex items-center"
      style={{ width: width }}
    >
      <CgSearch className="text-vant-purple text-3xl mr-5" />
      <Form action="/search" className="grow">
        <input
          type="text"
          name="s"
          placeholder="Search an article, author, or category"
          className="bg-transparent border-none focus:outline-none focus:ring-0 w-full h-full text-md lg:text-xl"
        />
      </Form>
    </section>
  );
}
