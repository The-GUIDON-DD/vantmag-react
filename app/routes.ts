import {
  index,
  layout,
  type RouteConfig,
  route,
} from "@react-router/dev/routes";

export default [
  layout("./layout.tsx", [
    index("./routes/home.tsx"),
    route("category/:slug", "./routes/category.tsx"),
    route("/:slug", "./routes/article.tsx"),
    route("/author/:slug", "./routes/author.tsx"),
    route("*", "./routes/page-not-found.tsx"),
  ]),
] satisfies RouteConfig;
