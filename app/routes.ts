import { index, layout, type RouteConfig } from "@react-router/dev/routes";

export default [
  layout("./layout.tsx", [index("./routes/home.tsx")]),
] satisfies RouteConfig;
