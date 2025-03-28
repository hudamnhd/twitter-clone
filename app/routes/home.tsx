import type { Route } from "./+types/home";
import cache from "#app/utils/cache-server";
import { getUser } from '#app/utils/auth.server';
import { Welcome } from "../welcome/welcome";

const cacheKeyPost = `posts`;
const cacheKey = `users`;

export function meta({ }: Route.MetaArgs) {
  return [
    { title: "New React Router App" },
    { name: "description", content: "Welcome to React Router!" },
  ];
}

export async function loader({ request }: Route.LoaderArgs) {
  const user = await getUser(request)
  const posts = cache.get(cacheKeyPost) || [];
  return { user, posts };
}

export async function action({ request }: Route.ActionArgs) {
  const user = await getUser(request)
  let formData = await request.formData();
  const submission = Object.fromEntries(formData);
  const _submission = {
    ...submission,
    id: Date.now(),
    updatedAt: Date.now(),
    user: {
      name: user.name,
      username: user.username,
    },
    likes: [],
    comments: [],
  }
  const cachedDataPosts = cache.get(cacheKeyPost) || [];
  const cachedData = cache.get(cacheKey) || [];
  const _user = {
    ...user,
    posts: [
      ...user.posts,
      { id: _submission.id }
    ]
  }

  const findIndex = cachedData.findIndex((d: { username: string }) =>
    d.username === user.username
  );

  if (findIndex !== -1) {
    const newCacheData = [...cachedData]
    newCacheData[findIndex] = _user
    cache.set(cacheKey, newCacheData);
  }

  const dataPosts = [...cachedDataPosts, _submission];
  cache.set(cacheKeyPost, dataPosts);

  return { success: true, messages: "Success" };
}

export default function Home({ loaderData }: Route.ComponentProps) {
  return <Welcome data={loaderData} />;
}
