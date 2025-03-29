import { PostView } from "#app/components/post-view";
import { Button } from "#app/components/ui/button";
import { getUser } from "#app/utils/auth.server";
import cache from "#app/utils/cache-server";
import { getInitials } from "#app/utils/misc";
import { data, useNavigate } from "react-router";
import type { Route } from "./+types/profile";

const cacheKeyPost = `posts`;
const cacheKey = `users`;

export function meta({ data }: Route.MetaArgs) {
  return [
    { title: data ? `${data.user.name} | Profile` : "Not Found" },
    {
      name: "description",
      content: data ? `${data.user.name} | Profile page` : "Not Found",
    },
  ];
}

export async function loader({ request, params }: Route.LoaderArgs) {
  const cachedData = cache.get(cacheKey) || [];
  const user = cachedData.find((d) => d.username === params.username);
  if (!user) throw data("User Not Found", { status: 404 });
  const userLogin = await getUser(request);
  const isMe = userLogin?.username === params.username;
  const cachedDataPosts = cache.get(cacheKeyPost) || [];
  const posts = cachedDataPosts.filter((d) =>
    d?.user?.username === params.username
  );
  return { user, posts, isMe };
}

export default function Profile({ loaderData }: Route.ComponentProps) {
  const { user, posts, isMe } = loaderData;
  const navigate = useNavigate();
  return (
    <main className="relative mx-auto min-h-screen w-full max-w-xl border-border border-x">
      <div className="sticky left-0 right-0 top-0 z-20  mx-auto flex h-[50px] max-w-xl items-center justify-between border-b border-slate-700 p-3 backdrop-blur-sm bg-background/50">
        <div className="flex  items-center gap-x-3">
          <Button size="icon" variant="ghost" onClick={() => navigate(-1)} className="[&_svg:not([class*='size-'])]:size-5">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19.5 12h-15m0 0l6.75 6.75M4.5 12l6.75-6.75"
              />
            </svg>
          </Button>
          <div className="my-0.5">
            <h1 className="text-[18px] font-semibold capitalize">
              {user.name}
            </h1>
            <p className="-mt-1 text-sm font-medium text-gray-400">
              {posts.length} posts
            </p>
          </div>
        </div>
      </div>

      <div className="pb-4 shadow-xl">
        <div className="relative h-32 sm:h-36">
          <div className="relative h-full w-full bg-gradient-to-br from-sky-400 via-sky-500 to-sky-600">
          </div>
          <div className="sm: absolute top-20 ml-4">
            <div className="absolute relative right-0  h-24 w-24 sm:h-32 sm:w-32 bg-sky-500 rounded-full ring-2 ring-black">
              <div className="flex items-center justify-center h-full text-4xl font-semibold">
                {getInitials(user.name)}
              </div>
            </div>
          </div>
        </div>
        <div className=" ml-4 flex flex-col">
          <div className="mx-4 mt-3 flex items-center justify-end gap-x-2">
            <div className="h-[36px]" />
            <div className="h-[36px]" />
            {!isMe &&
              (
                <a
                  className="w-[90px] rounded-full bg-[#eff3fa] py-2 text-center text-sm font-semibold text-black ring-1 ring-transparent hover:bg-[#eff3fa]/90 disabled:opacity-60"
                  href="/api/auth/signin"
                >
                  Follow
                </a>
              )}
          </div>
          <div className="mt-5 max-h-[200px] items-center">
            <h3 className="text-xl font-semibold capitalize text-[#e7e9ea]">
              {user.name}
            </h3>
            <div className="flex items-center gap-x-1 font-medium text-[#71767b]">
              <p className="-mt-0.5 text-[15px]">@{user.username}</p>
            </div>
            <div className="mt-4 flex flex-wrap gap-x-5">
              <span className="flex-none  text-[15px] text-[#71767b]">
                <span className="font-extrabold text-[#e7e9ea]">
                  {user.following.length}
                </span>{" "}
                Following
              </span>
              <span className="flex-none text-[15px] text-[#71767b]">
                <span className="font-extrabold text-[#e7e9ea]">
                  {user.followers.length}
                </span>{" "}
                Followers
              </span>
            </div>
          </div>
        </div>
      </div>
      <div className="w-full border-b border-slate-700" />
      {posts.length > 0
        ? posts.map((d) => <PostView d={d} key={d.id} />)
        : (
          <div className="grid h-[calc(100vh-50px)] place-content-center  px-4">
            <h1 className="font-medium uppercase tracking-widest text-gray-500">
              No data display
            </h1>
          </div>
        )}
    </main>
  );
}
