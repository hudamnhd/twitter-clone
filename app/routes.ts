import { index, route, type RouteConfig } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route(":username", "routes/profile.tsx"),
  route("post/:id", "routes/post.tsx"),
  route("login", "routes/auth/login.tsx"),
  route("logout", "routes/auth/logout.tsx"),
  route("register", "routes/auth/register.tsx"),
] satisfies RouteConfig;
