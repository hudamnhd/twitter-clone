import type { Route } from "./+types/home";
import cache from "#app/utils/cache-server";
import { getUser } from '#app/utils/auth.server';
import { AutosizeTextarea } from "#app/components/ui/autosize-textarea";
import { Avatar, AvatarFallback, AvatarImage } from "#app/components/ui/avatar";
import { Button } from "#app/components/ui/button";
import { PostView } from "#app/components/post-view";
import { getInitials } from "#app/utils/misc";
import { LogIn, LogOut } from "lucide-react";
import { Form, useNavigation } from "react-router";
import React from 'react'

const cacheKeyPost = `posts`;
const cacheKey = `users`;

export function meta({ }: Route.MetaArgs) {
  return [
    { title: "Twitter By React Router" },
    { name: "description", content: "Twitter By React Router" },
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

export default function Home({ loaderData, actionData }: Route.ComponentProps) {

  let $form = React.useRef<HTMLFormElement>(null)
  let navigation = useNavigation()

  React.useEffect(function resetFormOnSuccess() {
    if (navigation.state === "idle" && actionData?.success) {
      $form.current?.reset()
    }
  }, [navigation.state, actionData])

  return (
    <main className="relative mx-auto min-h-screen w-full max-w-xl border-border border-x">
      <div className="sticky left-0 right-0 top-0 z-20  mx-auto flex h-[50px] max-w-xl items-center justify-between border-b border-slate-700 p-3 backdrop-blur-sm">
        <h1 className="text-[20px] font-semibold ">Home</h1>
        {loaderData?.user
          ? (
            <Form method="post" action="/logout">
              <Button variant="ghost" type="submit">
                Log Out
                <LogOut />
              </Button>
            </Form>
          )
          : (
            <Form method="get" action="/login">
              <Button variant="ghost" type="submit">
                Log In
                <LogIn />
              </Button>
            </Form>
          )}
      </div>

      <div className="divide-y divide-slate-700 ">
        {loaderData?.user && (
          <div className="flex w-full items-start gap-3 p-4">
            <Avatar>
              <AvatarImage src="#" />
              <AvatarFallback className="bg-sky-500 font-semibold">
                {getInitials(loaderData.user.name)}
              </AvatarFallback>
            </Avatar>
            <Form method="post" ref={$form} className="w-full pt-1.5">
              <AutosizeTextarea
                name="content"
                minLength={5}
                required
                style={{ resize: "none" }}
                className="py-0.5 px-1.5 w-full bg-transparent outline-hidden text-md border-none focus-visible:ring-offset-0 focus-visible:ring-0 outline-hidden"
                maxHeight={800}
                placeholder="Apa yang sedang anda pikirkan?!"
                autoComplete="off"
              />
              <div className="mb-3 border-b border-slate-600" />
              <div className="flex justify-end">
                <button
                  type="submit"
                  className="flex justify-end rounded-full bg-sky-500 px-3 py-1.5 text-sm font-semibold disabled:opacity-60"
                >
                  Posting
                </button>
              </div>
            </Form>
          </div>
        )}
        {loaderData.posts.length > 0
          ? loaderData.posts.map((d,) => (<PostView d={d} key={d.id} />
          ))
          : (
            <div className="grid h-[calc(100vh-50px)] place-content-center  px-4">
              <h1 className="font-medium uppercase tracking-widest text-gray-500">
                No data display
              </h1>
            </div>
          )}
      </div>
    </main>
  );
}


