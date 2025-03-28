import type { Route } from "./+types/profile";
import { getUser } from '#app/utils/auth.server';
import { Button } from "#app/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "#app/components/ui/avatar"
import { Form, Link, useNavigate } from 'react-router'
import { getInitials } from '#app/utils/misc'
import cache from "#app/utils/cache-server";

const cacheKeyPost = `posts`;
const cacheKey = `users`;

export function meta({ data }: Route.MetaArgs) {
  return [
    { title: data ? `${data.user.name} | Profile` : "Not Found" },
    { name: "description", content: `${data.user.name} | Profile page` },
  ];
}

export async function loader({ request, params }: Route.LoaderArgs) {
  const userLogin = await getUser(request)
  const isMe = userLogin.username === params.username
  const cachedData = cache.get(cacheKey) || [];
  const cachedDataPosts = cache.get(cacheKeyPost) || [];
  const user = cachedData.find((d) => d.username === params.username)
  const posts = cachedDataPosts.filter((d) => d.user.username === params.username)
  return { user, posts, isMe };
}

export default function Profile({ loaderData }: Route.ComponentProps) {
  const { user, posts, isMe } = loaderData
  const navigate = useNavigate()
  return (
    <main className="relative mx-auto min-h-screen w-full max-w-2xl border-border border-x">
      <div className="sticky left-0 right-0 top-0 z-20  mx-auto flex h-[50px] max-w-2xl items-center justify-between border-b border-slate-700 p-3 backdrop-blur-sm">
        <div className="flex  items-center gap-x-3">
          <Button size="icon" variant="ghost" onClick={() => navigate(-1)}>
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
            <h1 className="text-[18px] font-semibold capitalize">{user.name}</h1>
            <p className="-mt-1 text-sm font-medium text-gray-400">{posts.length} posts</p>
          </div>
        </div>
      </div>

      <div className="pb-4 shadow-xl">
        <div className="relative h-32 sm:h-36">
          <div className="relative h-full w-full bg-gradient-to-tr from-sky-300 via-white to-sky-300"><div className="absolute bottom-0 left-0 right-0 top-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:14px_24px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_110%)]"></div></div>
          <div className="sm: absolute top-20 ml-4">
            <div className="absolute relative right-0  h-24 w-24 sm:h-32 sm:w-32 bg-sky-500 rounded-full ring-2 ring-black">
              <div className='flex items-center justify-center h-full text-4xl font-semibold'>{getInitials(user.name)}</div>
            </div>
          </div>
        </div>
        <div className=" ml-4 flex flex-col">
          <div className="mx-4 mt-3 flex items-center justify-end gap-x-2">

            <div className="h-[36px]" />
            <div className="h-[36px]" />
            {!isMe &&
              <a
                className="w-[90px] rounded-full bg-[#eff3fa] py-2 text-center text-sm font-semibold text-black ring-1 ring-transparent hover:bg-[#eff3fa]/90 disabled:opacity-60"
                href="/api/auth/signin"
              >
                Follow
              </a>}
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
                <span className="font-extrabold text-[#e7e9ea]">{user.following.length}</span> Following
              </span>
              <span className="flex-none text-[15px] text-[#71767b]">
                <span className="font-extrabold text-[#e7e9ea]">{user.followers.length}</span> Followers
              </span>
            </div>
          </div>
        </div>
      </div>
      <div className="w-full border-b border-slate-700" />
      {posts.length > 0 ? posts.map((d, index) => (
        <div className="w-full">
          <div className="flex gap-x-3 gap-y-1  border-b border-slate-700 px-4 py-3 hover:bg-slate-800/20">
            <div className="flex flex-none min-w-[45px]">
              <Link to={`/${d.user.username}`}>
                <Avatar>
                  <AvatarImage src="#" />
                  <AvatarFallback className="bg-sky-500 font-semibold">{getInitials(d.user.name)}</AvatarFallback>
                </Avatar>
              </Link>
            </div>
            <div className="min-w-0 w-full">
              <div className="flex justify-between gap-x-2.5 text-[15px] text-slate-300 w-full">
                <div className="xs:overflow-visible xs:whitespace-normal mb-1 flex items-center gap-x-1.5 truncate leading-5 [@media(max-width:360px)]:flex-wrap">
                  <Link to={`/${d.user.username}`}
                    className="truncate font-semibold capitalize text-[#e7e9ea]"
                  >
                    <p className="truncate font-semibold capitalize text-[#e7e9ea]">
                      {d.user.name}
                    </p>
                  </Link>
                  <Link className="truncate text-[#71767b]"
                    to={`/${d.user.username}`}>
                    @{d.user.username}
                  </Link>
                  <span className="text-[#71767b]">·</span>
                  <Link
                    className="text-[#71767b]"
                    to={`/post/${d.id}`}>
                    {new Date(d.id).toLocaleString("id-ID")}
                  </Link>
                </div>
                <div className="relative h-[22px]">
                  <button className="peer text-gray-400 transition-all duration-200 hover:text-sky-500 ">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={2}
                      stroke="currentColor"
                      className="h-[22px] w-[22px]"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M6.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM12.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM18.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0z"
                      />
                    </svg>
                  </button>
                  <div className='invisible absolute -right-2 -top-5 z-10 w-[200px] rounded-md border border-slate-700 opacity-0 transition-all duration-300 after:absolute after:top-0 after:-z-20 after:inline-block after:h-full after:w-full after:rounded-md after:bg-slate-900  after:content-[""] peer-focus:visible peer-focus:top-0 peer-focus:opacity-100'>
                    <div className="p-1">
                      <button
                        className="flex w-full items-center gap-2 rounded-md p-2 text-sm hover:bg-slate-800"
                        role="menuitem"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={2}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10"
                          />
                        </svg>
                        Edit Post
                      </button>
                      <button
                        type="submit"
                        className="flex w-full items-center gap-2 rounded-md p-2 text-sm hover:bg-slate-800"
                        role="menuitem"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={2}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                        Delete Post
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              <Link
                to={`/post/${d.id}`}>
                <span className="whitespace-pre-wrap break-all leading-snug text-[#e7e9ea]">{d.content}</span>
              </Link>
              <div className="mt-2 flex h-[18px] items-center justify-between gap-x-1">
                <button className="fill-transparent text-gray-500 hover:text-[#f91880] group  flex items-center gap-x-1.5 sm:min-w-[40px]">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="currentColor"
                    className="h-[18px] w-[18px]"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
                    />
                  </svg>
                  <span className="text-gray-500 group-hover:text-[#f91880] text-sm font-medium" />
                </button>
                <a
                  className="flex items-center gap-x-1.5 text-gray-500 hover:text-sky-500"
                  href="/post/cm8r45b180003i54iz9lratmp"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="currentColor"
                    className="h-[18px] w-[18px]"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 20.25c4.97 0 9-3.694 9-8.25s-4.03-8.25-9-8.25S3 7.444 3 12c0 2.104.859 4.023 2.273 5.48.432.447.74 1.04.586 1.641a4.483 4.483 0 01-.923 1.785A5.969 5.969 0 006 21c1.282 0 2.47-.402 3.445-1.087.81.22 1.668.337 2.555.337z"
                    />
                  </svg>
                  <span className="text-sm" />
                </a>
                <button className="text-gray-500 hover:text-green-500">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="currentColor"
                    className="h-[18px] w-[18px]"
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
                    className="h-[18px] w-[18px]"
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
                    className="h-[18px] w-[18px]"
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
        </div>
      )) : (
        <div className="grid h-[calc(100vh-50px)] place-content-center  px-4">
          <h1 className="font-medium uppercase tracking-widest text-gray-500">
            No data display
          </h1>
        </div>
      )
      }
    </main>
  )
}

