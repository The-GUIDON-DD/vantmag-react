import { Link } from "react-router";
import type { Author } from "../types";

export default function Bylines({ authors }: { authors: Author[] }) {
  if (authors.length === 0) {
    return <></>;
  } else if (authors.length === 1) {
    return (
      <Link to={`/author/${authors[0].slug}`}>
        <p>{authors[0].display_name}</p>
      </Link>
    );
  } else if (authors.length === 2) {
    return (
      <p>
        <Link to={`/author/${authors[0].slug}`}>{authors[0].display_name}</Link>{" "}
        and{" "}
        <Link to={`/author/${authors[1].slug}`}>{authors[1].display_name}</Link>
      </p>
    );
  } else {
    return (
      <p>
        {authors.map(({ slug, display_name }, ix) => (
          <span key={display_name}>
            {ix === authors.length - 1 && "and "}
            <Link to={`/author/${slug}`}>{display_name}</Link>
            {ix < authors.length - 1 && ", "}
          </span>
        ))}
      </p>
    );
  }
}
