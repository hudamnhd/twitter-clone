import { useNavigate, Link } from 'react-router'
import { getInitials } from '#app/utils/misc'
import type { Route } from "./+types/post";
import { Avatar, AvatarFallback, AvatarImage } from "#app/components/ui/avatar"
import { Button } from "#app/components/ui/button";

import cache from "#app/utils/cache-server";

const cacheKeyPost = `posts`;
const cacheKey = `users`;

export function meta({ data }: Route.MetaArgs) {
  return [
    { title: data ? `${data.post.content}` : "Not Found" },
    { name: "description", content: `${data.post.content}` },
  ];
}

export async function loader({ request, params }: Route.LoaderArgs) {
  const cachedDataPosts = cache.get(cacheKeyPost) || [];
  const post = cachedDataPosts.find((d) => d.id === Number(params.id))
  return { post };
}

export default function Post({ loaderData }: Route.ComponentProps) {
  const { post } = loaderData
  const navigate = useNavigate()
  return (
    <main className="relative mx-auto min-h-screen w-full max-w-xl border-border border-x">
      <div className="sticky left-0 right-0 top-0 z-20  mx-auto flex h-[50px] max-w-xl items-center justify-between border-b border-slate-700 p-3 backdrop-blur-sm">
        <div className="flex  items-center gap-x-3">
          <Button size="icon" variant="ghost" onClick={() => navigate(-1)}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="h-[20px] w-[20px]"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19.5 12h-15m0 0l6.75 6.75M4.5 12l6.75-6.75"
              />
            </svg>
          </Button>
          <h1 className="text-lg font-semibold capitalize">Post </h1>
        </div>
      </div>
      <div className="  w-full gap-3 border-b border-slate-700 px-4 pt-3">
        <div className="flex gap-3">
          <div>
            <Link to={`/${post.user.username}`}>
              <Avatar>
                <AvatarImage src="#" />
                <AvatarFallback className="bg-sky-500 font-semibold">{getInitials(post.user.name)}</AvatarFallback>
              </Avatar>
            </Link>
          </div>
          <div className="flex w-full flex-1 flex-col gap-0.5 ">
            <div className="flex justify-between text-[15px] text-slate-300">
              <div className="flex flex-col">
                <Link className="font-bold capitalize" to={`/${post.user.username}`}>
                  {post.user.name}
                </Link>
                <Link className="-mt-0.5 text-sm text-[#71767b]"
                  to={`/${post.user.username}`}>
                  @{post.user.username}
                </Link>
              </div>
            </div>
          </div>
        </div>
        <div className="flex flex-col  pt-4">
          <span className="mb-2 whitespace-pre-wrap break-all text-[16px]">
            {post.content}
          </span>
          <Link
            className="text-[#71767b]"
            to={`/post/${post.id}`}>
            {new Date(post.updatedAt).toLocaleString("id-ID")}
          </Link>
          <div className="flex  items-center justify-around gap-x-1 border-t border-slate-700 py-2">
            <button className="fill-transparent text-gray-500 hover:text-[#f91880] group  flex items-center gap-x-1.5 sm:min-w-[40px]">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="h-[18px] w-[18px] sm:h-[22px] sm:w-[22px]"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
                />
              </svg>
              <span className="text-sm" />
            </button>
            <button className="flex items-center gap-x-1.5 text-gray-500 hover:text-sky-500">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="h-[18px] w-[18px] sm:h-[22px] sm:w-[22px]"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 20.25c4.97 0 9-3.694 9-8.25s-4.03-8.25-9-8.25S3 7.444 3 12c0 2.104.859 4.023 2.273 5.48.432.447.74 1.04.586 1.641a4.483 4.483 0 01-.923 1.785A5.969 5.969 0 006 21c1.282 0 2.47-.402 3.445-1.087.81.22 1.668.337 2.555.337z"
                />
              </svg>
              <span className="text-sm" />
            </button>
            <button className="text-gray-500 hover:text-green-500">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="h-[18px] w-[18px] sm:h-[22px] sm:w-[22px]"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M19.5 12c0-1.232-.046-2.453-.138-3.662a4.006 4.006 0 00-3.7-3.7 48.678 48.678 0 00-7.324 0 4.006 4.006 0 00-3.7 3.7c-.017.22-.032.441-.046.662M19.5 12l3-3m-3 3l-3-3m-12 3c0 1.232.046 2.453.138 3.662a4.006 4.006 0 003.7 3.7 48.656 48.656 0 007.324 0 4.006 4.006 0 003.7-3.7c.017-.22.032-.441.046-.662M4.5 12l3 3m-3-3l-3 3"
                />
              </svg>
            </button>
            <button className="text-gray-500 hover:text-sky-500">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                strokeWidth={2}
                className="h-[18px] w-[18px] sm:h-[22px] sm:w-[22px]"
              >
                <path d="M8.75 21V3h2v18h-2zM18 21V8.5h2V21h-2zM4 21l.004-10h2L6 21H4zm9.248 0v-7h2v7h-2z" />
              </svg>
            </button>
            <button className="text-gray-500 hover:text-sky-500">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="h-[18px] w-[18px] sm:h-[22px] sm:w-[22px]"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
      <div className="" />
    </main>
  )
}

