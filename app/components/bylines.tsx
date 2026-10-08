import { Link } from "react-router";
import type { Author } from "../types";

export default function Bylines({ authors }: { authors: Author[] }) {
  if (authors.length === 0) {
    return <></>;
  } else if (authors.length === 1) {
    return (
      <Link
        to={`/author/${authors[0].slug}`}
        className="no-underline hover:underline"
      >
        <span>{authors[0].display_name}</span>
      </Link>
    );
  } else if (authors.length === 2) {
    return (
      <>
        <Link
          to={`/author/${authors[0].slug}`}
          className="no-underline hover:underline"
        >
          <span>{authors[0].display_name}</span>
        </Link>{" "}
        and{" "}
        <Link
          to={`/author/${authors[1].slug}`}
          className="no-underline hover:underline"
        >
          <span>{authors[1].display_name}</span>
        </Link>
      </>
    );
  } else {
    return (
      <>
        {authors.map(({ slug, display_name }, ix) => (
          <span key={display_name}>
            {ix === authors.length - 1 && "and "}
            <Link
              to={`/author/${slug}`}
              className="no-underline hover:underline"
            >
              <span className="no-underline hover:underline">
                {display_name}
              </span>
            </Link>
            {ix < authors.length - 1 && ", "}
          </span>
        ))}
      </>
    );
  }
}
